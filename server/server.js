// server/server.js
const express = require("express");
const path = require("path");

const app = express();

// Serve static files from /public
app.use(express.static(path.join(__dirname, "../public")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Session endpoint (placeholder – adjust as needed for your ASR/keys)
app.get("/session", (req, res) => {
  res.json({
    model: "gpt-4o-realtime-preview-2024-12-17",
    voice: "verse",
    lang: "en",
  });
});

// Start server on Fly’s assigned PORT (fallback to 3000 locally)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
