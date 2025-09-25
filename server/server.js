import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/session", async (req, res) => {
  try {
    // 1️⃣ Create realtime session
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

    const text = await r.text();
    console.log("\n🔎 FULL SESSION RESPONSE FROM OPENAI:");
    console.log(text);

    if (!r.ok) {
      console.error("❌ SESSION CREATION FAILED:", r.status);
      return res.status(500).json({
        error: true,
        status: r.status,
        message: `OpenAI API returned error ${r.status}`,
        raw: text
      });
    }

    const json = JSON.parse(text);
    const token = json.client_secret?.value || null;

    if (!token) {
      console.error("⚠️ No client_secret.value in response:", json);
      return res.status(500).json({
        error: true,
        message: "No token returned from OpenAI. Possible quota or billing issue.",
        raw: json
      });
    }

    // 2️⃣ GPT-4o diagnostic check
    console.log("🔧 Running GPT-4o diagnostic check...");
    const test = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Say 'API test OK'." }],
        max_tokens: 20
      })
    });

    const testText = await test.text();
    console.log("📡 GPT-4o test response:", testText);

    res.json({ token });

  } catch (err) {
    console.error("💥 ERROR creating session:", err);
    res.status(500).json({
      error: true,
      message: "Server failed to create session.",
      raw: err.message
    });
  }
});

app.use(express.static("public"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 VoxTalk server running on port ${port}`));
