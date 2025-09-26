let ws;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioCtx;
let responseTimer;

const talkBtn = document.getElementById("talk-btn");
const transcriptEl = document.getElementById("transcript");
const bannerEl = document.getElementById("alertBanner");

// --- UI Helpers ---
function appendTranscript(speaker, text) {
  transcriptEl.innerHTML += `<div><b>${speaker}:</b> ${text}</div>`;
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

function banner(msg, tone = "warn") {
  bannerEl.style.display = "block";
  bannerEl.textContent = msg;
  bannerEl.className = tone === "ok" ? "banner ok" : "banner warn";
}

function clearBanner() {
  bannerEl.style.display = "none";
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Connect to Realtime WS ---
function connectWS() {
  return fetch("/session", { method: "POST" })
    .then((r) => r.json())
    .then((data) => {
      if (data.error) {
        banner(`API Error: ${data.message}`, "warn");
        return null;
      }
      const wsUrl = `wss://api.openai.com/v1/realtime?session=${
        data.token.split("session=")[1] || data.token
      }`;
      const sock = new WebSocket(wsUrl, ["realtime"]);
      sock.binaryType = "arraybuffer";
      return sock;
    })
    .catch((err) => {
      banner(`Session fetch error: ${err.message}`, "warn");
      return null;
    });
}

// --- Start/Stop Recording ---
async function toggleRecording() {
  if (!isRecording) await startRecording();
  else stopRecording();
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    ws = await connectWS();
    if (!ws) {
      banner("No session token — fallback only.", "warn");
    }

    if (ws) {
      ws.onopen = () => console.log("✅ WS connected");

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "output_text.delta") {
            clearTimeout(responseTimer);
            appendTranscript("VoxTalk", msg.delta);
          }
          if (msg.type === "output_audio.delta") {
            clearTimeout(responseTimer);
            playAudioChunk(msg.delta);
          }
          if (msg.type === "response.error") {
            banner(`Realtime error: ${msg.error?.message}`, "warn");
          }
        } catch {}
      };

      ws.onerror = (e) =>
        banner(`Realtime WS error: ${e?.message || e}`, "warn");
      ws.onclose = () =>
        console.log("🔌 WS closed — may fallback if no deltas.");
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      blob.arrayBuffer().then((buf) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "input_audio_buffer.append",
              audio: arrayBufferToBase64(buf),
            })
          );
          ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
          ws.send(
            JSON.stringify({
              type: "response.create",
              response: {
                modalities: ["audio", "text"],
                instructions: "Respond naturally and include text transcript.",
                audio: { voice: "alloy" },
              },
            })
          );

          // Watchdog timer → fallback if no deltas in 3s
          clearTimeout(responseTimer);
          responseTimer = setTimeout(() => {
            banner("Realtime silent — using fallback.", "warn");
            fallbackSpeak([{ role: "user", content: "(user spoke)" }]);
          }, 3000);
        } else {
          banner("Realtime not available — fallback now.", "warn");
          fallbackSpeak([{ role: "user", content: "(user spoke)" }]);
        }
      });
    };

    mediaRecorder.start();
    appendTranscript("You", "<i>Listening…</i>");
    isRecording = true;
    talkBtn.textContent = "🛑 Stop";
  } catch (err) {
    banner(`Microphone error: ${err.message}`, "warn");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  isRecording = false;
  talkBtn.textContent = "🎙️ Talk / Stop";
}

// --- Fallback Chat + TTS ---
async function fallbackSpeak(messages) {
  try {
    const r = await fetch("/chat-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const textHeader = decodeURIComponent(r.headers.get("x-text") || "");
    appendTranscript("VoxTalk (fallback)", textHeader);
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
    banner("Fallback voice active.", "ok");
  } catch (err) {
    banner("Fallback failed — check server logs.", "warn");
  }
}

// --- Audio Playback ---
function playAudioChunk(base64Data) {
  if (!audioCtx) audioCtx = new AudioContext();
  const audioData = Uint8Array.from(atob(base64Data), (c) =>
    c.charCodeAt(0)
  ).buffer;
  audioCtx.decodeAudioData(audioData).then((decoded) => {
    const source = audioCtx.createBufferSource();
    source.buffer = decoded;
    source.connect(audioCtx.destination);
    source.start();
  });
}

talkBtn.addEventListener("click", toggleRecording);
