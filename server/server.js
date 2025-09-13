const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

// Serve static frontend
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root always serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Session endpoint – static JSON shape
app.post("/session", (req, res) => {
  res.json({
    client_secret: { value: process.env.OPENAI_API_KEY || "missing_key" },
    model: "gpt-4o-realtime-preview",   // 🔄 rolled back to plain preview
    voice: "alloy",
    input_language: "en"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VoxTalk server listening on port ${PORT}`);
});
