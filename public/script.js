let ws;
let mediaRecorder;
let audioChunks = [];
const talkBtn = document.getElementById("talk-btn");
const transcriptEl = document.getElementById("transcript");
let isRecording = false;
let audioCtx;

function connectWS() {
  fetch("/session", { method: "POST" })
    .then(r => r.json())
    .then(data => {
      console.log("Session token:", data.token);
      if (!data.token) {
        console.error("No token received!");
        return;
      }
      const wsUrl = `wss://api.openai.com/v1/realtime?session=${data.token.split("session=")[1] || data.token}`;
      console.log("Connecting to OpenAI WS:", wsUrl);

      ws = new WebSocket(wsUrl, ["realtime"]);
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        console.log("✅ WS connected");

        // Send session.update to configure modalities
        ws.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["audio", "text"],
            instructions: "You are VoxTalk. Speak naturally but also return text output for display."
          }
        }));

        // Send test message immediately
        ws.send(JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["audio", "text"],
            instructions: "Say hello. This is a connection test. Keep it very short."
          }
        }));
      };

      // 🔔 Log every single raw event so we can see errors or completions
      ws.onmessage = (ev) => {
        console.log("🔔 RAW EVENT:", ev.data);
        onMessage(ev);
      };

      ws.onerror = (e) => console.error("❌ WS error:", e);
      ws.onclose = (e) => console.log("🔌 WS closed", e);
    })
    .catch(err => console.error("Session fetch error:", err));
}

function onMessage(ev) {
  const msg = typeof ev.data === "string" ? JSON.parse(ev.data) : null;
  if (!msg) return;

  if (msg.type === "output_text.delta") appendTranscript("VoxTalk", msg.delta);
  if (msg.type === "output_audio.delta") playAudioChunk(msg.delta);

  if (msg.type === "response.error") {
    console.error("🚨 OpenAI Response Error:", msg);
    appendTranscript("System", `<span style="color:red;">Error: ${msg.error?.message || "Unknown"}</span>`);
  }
}

function playAudioChunk(base64Data) {
  if (!audioCtx) audioCtx = new AudioContext();
  const audioData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
  audioCtx.decodeAudioData(audioData).then(decoded => {
    const source = audioCtx.createBufferSource();
    source.buffer = decoded;
    source.connect(audioCtx.destination);
    source.start();
  });
}

function appendTran
