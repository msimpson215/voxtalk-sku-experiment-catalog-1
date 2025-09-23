import express from "express";
const app = express();
app.use(express.static("public"));

app.post("/session", async (req, res) => {
  try {
    // ✅ Return fake session if DEV_MODE=true
    if (process.env.DEV_MODE === "true") {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      return res.json({
        client_secret: { value: "fake-secret", expires_at: expiresAt },
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        dev_mode: true
      });
    }

    // ✅ Real mode: hit OpenAI Realtime API
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
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
        instructions: "You are VoxTalk, an upbeat AI assistant. Respond in English."
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
    console.error("Session error:", e);
    res.status(500).json({ error: "session failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server running on " + PORT));
