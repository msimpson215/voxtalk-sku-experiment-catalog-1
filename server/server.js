import express from "express";
import fetch from "node-fetch"; // make sure installed with `npm install node-fetch`

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
        voice: "alloy",
        instructions: `Speak a short summary in audio, but return structured JSON in text:
        {
          "product": "1975 Corvette Headlight Motor (Driver’s Side)",
          "description": "Replacement headlight motor assembly for 1975 Corvette. Driver’s side fitment. OEM quality.",
          "price": "$179.99",
          "url": "https://corvetteparts.com/1975/headlight-motor-driver",
          "image": "https://corvetteparts.com/images/1975-headlight-motor.jpg"
        }`
      })
    });

    const data = await r.json();
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
app.listen(PORT, () => console.log("Server running on " + PORT));
