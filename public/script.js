let ws;
const talkBtn = document.getElementById("talk-btn");
const stopBtn = document.getElementById("stop-btn");
const transcriptEl = document.getElementById("transcript");

function connectWS() {
  fetch("/session", { method: "POST" })
    .then(r => r.json())
    .then(data => {
      if (!data.client_secret) {
        console.error("No client_secret received:", data);
        return;
      }
      ws = new WebSocket(data.client_secret, ["realtime"]);

      ws.onopen = () => console.log("WebSocket connected.");
      ws.onerror = (e) => console.error("WebSocket error:", e);
      ws.onclose = () => console.log("WebSocket closed.");
      ws.onmessage = onMessage;
    })
    .catch(err => console.error("Session error:", err));
}

function onMessage(ev) {
  const msg = JSON.parse(ev.data);

  switch (msg.type) {
    case "output_text.delta":
      transcriptEl.innerHTML += msg.delta.replace(/\n/g, "<br>");
      transcriptEl.scrollTop = transcriptEl.scrollHeight;
      break;

    case "output_text.completed":
      console.log("Full text completed.");
      break;

    case "output_audio.delta":
      console.log("Received audio chunk.");
      // TODO: decode & play audio here
      break;

    case "response.completed":
      console.log("Response fully completed.");
      break;
  }
}

// --- Init ---
connectWS();

talkBtn.addEventListener("click", () => {
  console.log("Talk button pressed.");
  // Start microphone recording + send to WS here
});

stopBtn.addEventListener("click", () => {
  console.log("Stop button pressed.");
  // Stop mic recording, close WS if desired
});
