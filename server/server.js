const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.post('/session', express.json(), (req, res) => {
  res.json({
    client_secret: { value: "YOUR_OPENAI_CLIENT_SECRET" },
    model: "tts-1",
    voice: "alloy"
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
