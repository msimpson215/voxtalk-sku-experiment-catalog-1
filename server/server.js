// Simple Express server for OpenAI GPT-4o chat API
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Set this as env var

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: "Missing OpenAI API key" });
  if (!userMessage) return res.status(400).json({ error: "Missing message" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a friendly grocery shopping assistant. Help the user shop and answer conversationally." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 200
      })
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get an answer.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI backend listening on port ${PORT}`);
});
