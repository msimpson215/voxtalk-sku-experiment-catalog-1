import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import WebSocket from "ws";
dotenv.config();

const app = express();
app.use(express.json());

// --- STEP 1: Create Session and Log Full Response ---
app.post("/session", async (req, res) => {
  try {
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
      return res.status(r.status).send(text);
    }

    const json = JSON.parse(text);
    const token = json.client_secret?.value || n_
