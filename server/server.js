import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/session", async (req, res) => {
  try {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        modalities: ["audio", "text"]
      })
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("Session creation failed:", text);
      return res.status(r.status).send(text);
    }

    const json = await r.json();
    console.log("OpenAI session (token):", json.client_secret.value);
    res.json({ token: json.client_secret.value }); // return only token
  } catch (err) {
    console.error("Session error:", err);
    res.status(500).send("Error creating session");
  }
});

app.use(express.static("public"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`VoxTalk running on port ${port}`));
