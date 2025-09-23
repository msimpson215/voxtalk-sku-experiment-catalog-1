import express from "express";

const app = express();
app.use(express.static("public"));

function resolveMode(req) {
  const q = String(req.query.mode || "").toLowerCase();
  if (q === "dev") return "dev";
  if (q === "real") return "real";
  if (process.env.DEV_MODE === "true") return "dev";
  if (!process.env.OPENAI_API_KEY) return "dev";
  return "real";
}

app.get("/debug", (req, res) => {
  const mode = resolveMode(req);
  res.type("html").send(`
    <style>
      body{font-family:sans-serif;padding:16px}
      .pill{display:inline-block;padding:4px 8px;border-radius:999px}
      .dev{background:gold;color:#111}
      .real{background:#222;color:#fff}
    </style>
    <h1>/debug</h1>
    <p>Resolved mode: <span class="pill ${mode === "dev" ? "dev" : "real"}">${mode.toUpperCase()}</span></p>
    <p>DEV_MODE env: ${process.env.DEV_MODE ?? "(unset)"}</p>
    <p>OPENAI_API_KEY present: ${Boolean(process.env.OPENAI_API_KEY)}</p>
    <p>Override: <code>?mode=dev</code> or <code>?mode=real</code></p>
  `);
});

app.post("/session", async (req, res) => {
  try {
    const mode = resolveMode(req);
    if (mode === "dev") {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      return res.json({
        client_secret: { value: "fake-secret", expires_at: expiresAt },
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        dev_mode: true
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

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
        instructions: "You are VoxTalk, an upbeat AI assistant. Respond in English."
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    res.json({
      client_secret: data.client_secret,
      model: "gpt-4o-realtime-preview",
      voice: "alloy",
      dev_mode: false
    });
  } catch (e) {
    console.error("Session error:", e);
    res.status(500).json({ error: "session failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server running on " + PORT));
