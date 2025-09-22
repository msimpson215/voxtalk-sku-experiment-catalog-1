import express from "express";

const app = express();
app.use(express.static("public"));

app.post("/session", async (req, res) => {
  try {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "nova",
        instructions:
          "You are VoxTalk, an AI voice assistant. Always respond in English. Keep an upbeat, friendly tone."
      })
    });

    const data = await r.json();
    console.log("🔧 OpenAI Session Response:", data);

    if (!data.client_secret) {
      console.error("❌ OpenAI returned no client_secret");
      return res.status(500).json({
        error: "No client_secret from OpenAI — check API key or billing."
      });
    }

    res.json({
      client_secret: data.client_secret,
      model: "gpt-4o-realtime-preview",
      voice: "nova"
    });
  } catch (e) {
    console.error("Session error:", e);
    res.status(500).json({ error: "Session failed — could not reach OpenAI." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server running on " + PORT));
