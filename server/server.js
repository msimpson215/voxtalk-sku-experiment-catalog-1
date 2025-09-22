import "dotenv/config";
import express from "express";

const app = express();
app.use(express.static("public"));

app.post("/session", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY on server");
      return res.status(500).json({ error: "Missing API key on server" });
    }

    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime=v1"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        instructions: "You are VoxTalk, an AI voice assistant. Always respond in English. Keep an upbeat, friendly tone."
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("❌ Session API failed:", data);
      return res.status(r.status).json(data);
    }

    console.log("✅ Session created");
    res.json({
      client_secret: data.client_secret,
      model: "gpt-4o-realtime-preview",
      voice: "alloy"
    });
  } catch (e) {
    console.error("Session error:", e);
    res.status(500).json({ error: "session failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server running on " + PORT));
