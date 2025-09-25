const talkButton = document.getElementById("talk-button");
const stopButton = document.getElementById("stop-button");
const transcriptBox = document.getElementById("transcript");

let ws;
let mediaRecorder;

async function initSession() {
  const resp = await fetch("/session", { method: "POST" });
  const data = await resp.json();

  ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=${data.model}`, [
    "realtime",
    `openai-insecure-api-key.${data.client_secret.value}`,
    "openai-beta.realtime-v1"
  ]);

  ws.onopen = () => console.log("Realtime connected");
  ws.onclose = () => console.log("Realtime closed");
  ws.onerror = (e) => console.error("Realtime error:", e);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "response.audio.delta") {
      if (!audioElement) {
        audioElement = new Audio();
        audioElement.src = `data:audio/wav;base64,${msg.delta}`;
        audioElement.play();
      }
    }

    if (msg.type === "response.output_text.delta") {
      transcriptBox.innerHTML += msg.delta;
    }

    if (msg.type === "response.output_text.done") {
      transcriptBox.innerHTML += "<br>";
    }
  };
}

let audioElement;

talkButton.onclick = async () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    await initSession();
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
      event.data.arrayBuffer().then(buffer => {
        ws.send(buffer);
      });
    }
  };
  mediaRecorder.start(250);
};

stopButton.onclick = () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
};
