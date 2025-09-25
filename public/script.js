let ws;
const talkBtn = document.getElementById("talk-btn");
const stopBtn = document.getElementById("stop-btn");
const transcriptEl = document.getElementById("transcript");

function connectWS() {
  fetch("/session", { method: "POST" })
    .then(r => r.json())
    .then(data => {
      ws = new WebSocket(data.client_secret, ["realtime"]);
      ws.onopen = () => console.log("WebSocket connected.");
      ws.onmessage = onMessage;
      ws.onerror = (e) => console.error("WebSocket error:", e);
      ws.onclose = () => console.log("WebSocket closed.");
    })
    .catch(err => console.error("Session error:", err));
}

function onMessage(ev) {
  const msg = JSON.parse(ev.data);
  if (msg.type === "output_text.delta") {
    transcriptEl.innerHTML += msg.delta;
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }
  if (msg.type === "output_audio.delta") {
    console.log("Audio chunk received.");
    // Audio playback code goes here (if implemented)
  }
  if (msg.type === "response.completed") {
    console.log("Response completed.");
  }
}

// --- Init ---
connectWS();

talkBtn.addEventListener("click", () => {
  console.log("Talk button pressed.");
  // Start mic capture and send audio chunks to ws here
});

stopBtn.addEventListener("click", () => {
  console.log("Stop button pressed.");
  // Stop mic capture and close websocket if needed
});
