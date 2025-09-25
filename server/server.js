import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/session", async (req, res) => {
  try {
    // 1️⃣ Try to create realtime session
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

    // 2️⃣ If session creation failed, send error straight back to client
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
      consol
