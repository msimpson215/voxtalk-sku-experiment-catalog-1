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
        voice: "nova",  // 🔒 locked to Nova
        instructions:
          "You are an AI voice assistant. ALWAYS respond in English. Never default to Spanish. If the user speaks another language, translate it and reply only in English."
      })
    });

    const raw = await r.text();
    console.log("OpenAI session response:", raw); // debug log

    const data = JSON.parse(raw);
    res.json({
      client_secret: data.client_secret,
      model: "gpt-4o-realtime-preview",
      voice: "nova"   // return Nova explicitly
    });
  } catch (e) {
    console.error("Session error:", e);
    res.status(500).json({ error: "session failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
