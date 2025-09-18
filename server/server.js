import express from "express";

const app = express();
app.use(express.static("public"));

app.post("/session", async (req, res) => {
  try {
    // This is where you would request TTS from your backend or OpenAI
    // For demo purposes, just respond with a static greeting
    res.json({
      greeting: "Hello, this is VoxTalk. How can I help you today?",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Replace with your own dynamic audio if needed
    });
  } catch (e) {
    console.error("Session error:", e);
    res.status(500).json({ error: "session failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
