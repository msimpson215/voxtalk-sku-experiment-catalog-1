let ws;
let mediaRecorder;
let audioChunks = [];
const talkBtn = document.getElementById("talk-btn");
const transcriptEl = document.getElementById("transcript");
let isRecording = false;
let audioCtx;
let sourceNode;
let audioBufferQueue = [];

// Connect to OpenAI Realtime session
function connectWS() {
  fetch("/session", { method: "POST" })
    .then(r => r.json())
    .then(data => {
      const wsUrl = data?.client_secret?.value;
      if (!wsUrl) {
        console.error("No client_secret.value in session response", data);
        return;
      }
      ws = new WebSocket(wsUrl, ["realtime"]);
      ws.binaryType = "arraybuffer";

      ws.onopen = () => console.log("WS connected:", wsUrl);
      ws.onmessage = onMessage;
      ws.onerror = (e) => console.error("WS error:", e);
      ws.onclose = () => console.log("WS closed.");
    })
    .catch(err => console.error("Session error:", err));
}

// Handle incoming events (text + audio)
function onMessage(ev) {
  const msg = typeof ev.data === "string" ? JSON.parse(ev.data) : null;

  if (msg?.type === "output_text.delta") {
    appendTranscript("VoxTalk", msg.delta);
  }

  if (msg?.type === "output_audio.delta") {
    const audioBase64 = msg.delta;
    playAudioChunk(audioBase64);
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

function appendTranscript(speaker, text) {
  transcriptEl.innerHTML += `<div><b>${speaker}:</b> ${text}</div>`;
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

async function toggleRecording() {
  if (!isRecording) {
    await startRecording();
  } else {
    stopRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      blob.arrayBuffer().then(buf => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: arrayBufferToBase64(buf)
          }));
          ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
          ws.send(JSON.stringify({
            type: "response.create",
            response: {
              modalities: ["audio", "text"],
              instructions: "Speak a short summary out loud and return full text for display."
            }
          }));
        }
      });
    };

    mediaRecorder.start();
    appendTranscript("You", "<i>Listening...</i>");
    isRecording = true;
    talkBtn.textContent = "🛑 Stop";
  } catch (err) {
    console.error("Mic error:", err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  isRecording = false;
  talkBtn.textContent = "🎙️ Talk / Stop";
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Init ---
connectWS();
talkBtn.addEventListener("click", toggleRecording);
