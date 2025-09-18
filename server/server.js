const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Example session endpoint (replace with your actual OpenAI realtime logic)
app.post('/session', express.json(), (req, res) => {
  // Dummy values – replace with your OpenAI credentials/config
  res.json({
    client_secret: { value: "YOUR_OPENAI_CLIENT_SECRET" },
    model: "tts-1",
    voice: "alloy"
  });
});

// Fallback: serve index.html for any other route (for SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`VoxTalk server running on http://localhost:${PORT}`);
});
