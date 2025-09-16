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
        voice: "nova", // <-- change here!
        instructions:
          "Hello I'm Voxtalk. I was created by your dad, Marty Simpson, and he wanted me to say hello Mia and Rachel, nice to meet you... ask VoxTalk anything you want. ALWAYS respond in English. Never default to Spanish. If the user speaks another language, translate it and reply only in English."
      })
    });

    const data = await r.json();
    res.json({
      client_secret: data.client_secret,
      model: "gpt-4o-realtime-preview",
      voice: "nova", // <-- change here too!
      deepgramKey: process.env.DEEPGRAM_API_KEY
    });
  } catch (e) {
    console.error("Session error:", e);
    res.status(500).json({ error: "session failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
