let ws;
const sendQueue = [];
const talkBtn = document.getElementById("talk-btn");
const stopBtn = document.getElementById("stop-btn");
const transcriptEl = document.getElementById("transcript");
let speakingTimer;

function connectWS() {
  fetch("/session", { method: "POST" })
    .then(r => r.json())
    .then(data => {
      ws = new WebSocket(data.client_secret, ["realtime"]);
      ws.onopen = () => {
        while (sendQueue.length) ws.send(sendQueue.shift());
      };
      ws.onmessage = onMessage;
    })
    .catch(err => console.error("Session error:", err));
}

function safeSend(msg) {
  const payload = typeof msg === "string" ? msg : JSON.stringify(msg);
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(payload);
  else sendQueue.push(payload);
}

function appendTextDelta(delta) {
  transcriptEl.innerHTML += delta.replace(/\n/g, "<br>");
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

function setSpeaking(on) {
  if (on) {
    talkBtn.classList.add("speaking");
    clearTimeout(speakingTimer);
    speakingTimer = setTimeout(() => talkBtn.classList.remove("speaking"), 600);
  } else {
    talkBtn.classList.remove("speaking");
  }
}

function onMessage(ev) {
  const msg = JSON.parse(ev.data);
  if (msg.type === "output_text.delta") appendTextDelta(msg.delta || "");
  if (msg.type === "output_audio.delta") setSpeaking(true);
  if (msg.type === "response.completed") setTimeout(() => setSpeaking(false), 250);
}

// --- Init ---
connectWS();

talkBtn.addEventListener("click", () => {
  // start recording + safeSend chunks
});

stopBtn.addEventListener("click", () => {
  // stop recording and close WS if needed
});
