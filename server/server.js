import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import WebSocket from "ws";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-realtime-preview";

// --- Create realtime session
app.post("/session", async (req, res) => {
  try {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        voice: "alloy",
        modalities: ["audio", "text"],
      }),
    });

    const text = await r.text();
    console.log("\n🔎 FULL SESSION RESPONSE:");
    console.log(text);

    if (!r.ok) {
      return res.status(500).json({ error: true, raw: text });
    }

    const json = JSON.parse(text);
    const token = json.client_secret?.value || null;
    if (!token) {
      return res.status(500).json({ error: true, message: "No token returned" });
    }

    res.json({ token, model: DEFAULT_MODEL });
  } catch (err) {
    console.error("💥 ERROR creating session:", err);
    res.status(500).json({ error: true, message: String(err) });
  }
});

// --- Chat → TTS fallback
app.post("/chat-tts", async (req, res) => {
  try {
    const { messages } = req.body;
    const chat = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
      }),
    });

    const chatJson = await chat.json();
    const text =
      chatJson.choices?.[0]?.message?.content?.trim() ||
      "I’m here — using fallback until realtime is back.";

    const speech = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "alloy",
        input: text,
      }),
    });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("x-text", encodeURIComponent(text));
    speech.body.pipe(res);
  } catch (err) {
    console.error("💥 Fallback error:", err);
    res.status(500).json({ error: true, message: String(err) });
  }
});

// --- Simple realtime diagnostic endpoint
app.get("/diag/realtime", async (req, res) => {
  const model = req.query.model || DEFAULT_MODEL;
  const wsUrl = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(
    model
  )}`;
  const result = {
    model,
    connected: false,
    deltaCount: 0,
    closeCode: null,
    error: null,
  };

  try {
    const ws = new WebSocket(wsUrl, {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    });

    const timeout = setTimeout(() => {
      try {
        ws.close();
      } catch {}
    }, 3000);

    ws.on("open", () => (result.connected = true));

    ws.on("message", (buf) => {
      try {
        const msg = JSON.parse(buf.toString());
        if (msg.type === "output_text.delta") result.deltaCount++;
      } catch {}
    });

    ws.on("close", (code) => {
      clearTimeout(timeout);
      result.closeCode = code;
      res.json(result);
    });

    ws.on("error", (e) => {
      clearTimeout(timeout);
      result.error = e.message || String(e);
      res.status(500).json(result);
    });
  } catch (err) {
    result.error = String(err);
    res.status(500).json(result);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(
    `🚀 VoxTalk server running on port ${port} using model: ${DEFAULT_MODEL}`
  )
);
