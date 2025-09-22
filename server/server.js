import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.static("public"));

app.post("/session", async (req, res) => {
  console.log("📡 /session route called");

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is missing in environment!");
    return res.status(500).json({ error: "Missing API key" });
  }

  try {
    console.log("🌐 Sending request to OpenAI Realtime API...");
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime=v1"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        instructions:
          "You are VoxTalk, an AI voice assistant. Always respond in English. Keep an upbeat, friendly tone."
      })
    });

    console.log("📥 Response status:", r.status);
    const data = await r.json();
