import express from "express";

const app = express();
app.use(express.static("public"));

app.post("/session", async (req, res) => {
  try {
    // DEV_MODE: Simulate a session response for safe local testing
    if (process.env.DEV_MODE === "true") {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      return res.json({
        client_secret: { value: "fake-secret", expires_at: expiresAt },
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        dev_mode: true
      });
    }

    // REAL MODE: Requires OPENAI_API_KEY set in Render environment
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY on server" });
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
        instructions:
          "You are VoxTalk, an AI voice assistant. Always respond in English. Keep an upbeat, friendly tone."
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    res.json({
      client_secret: data.client_secret,
      model: "gpt-4o-realtime-preview",
      voice: "alloy",
      dev_mode: false
    });
  } catch (e) {
    res.status(500).json({ error: "session failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server running on " + PORT));
