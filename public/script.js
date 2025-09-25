let ws;
let mediaRecorder;
let audioChunks = [];
const talkBtn = document.getElementById("talk-btn");
const transcriptEl = document.getElementById("transcript");
let isRecording = false;

function connectWS() {
  fetch("/session", { method: "POST" })
    .then(r => r.json())
    .then(data => {
      const wsUrl = data?.client_secret?.value;
      if (!wsUrl) return console.error("No client_secret.value returned.");
      ws = new WebSocket(wsUrl, ["realtime"]);

      ws.onopen = () => console.log("WS connected.");
      ws.onmessage = onMessage;
      ws.onerror = (e) => console.error("WS error:", e);
      ws.onclose = () => console.log("WS closed.");
    })
    .catch(err => console.error("Session error:", err));
}

function onMessage(ev) {
  const msg = JSON.parse(ev.data);
  switch (msg.type) {
    case "output_text.delta":
      appendTranscript("VoxTalk", msg.delta);
      break;
    case "output_audio.delta":
      // TODO: decode & play audio (can be added once text streaming confirmed)
      break;
  }
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
          ws.send(JSON.stringify({ type: "response.create" }));
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
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Init ---
connectWS();
talkBtn.addEventListener("click", toggleRecording);
