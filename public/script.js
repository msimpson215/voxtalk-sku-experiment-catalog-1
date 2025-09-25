let ws;
let mockMode = false; // change to true to force mock demo
const talkBtn = document.getElementById("talk-btn");
const stopBtn = document.getElementById("stop-btn");
const transcriptEl = document.getElementById("transcript");

function connectWS() {
  fetch("/session", { method: "POST" })
    .then(r => r.json())
    .then(data => {
      if (!data.client_secret) {
        console.warn("No client_secret received — switching to mock mode.");
        mockMode = true;
        return;
      }
      ws = new WebSocket(data.client_secret, ["realtime"]);
      ws.onopen = () => console.log("WebSocket connected.");
      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        mockMode = true;
      };
      ws.onclose = () => console.log("WebSocket closed.");
      ws.onmessage = onMessage;
    })
    .catch(err => {
      console.error("Session error:", err);
      mockMode = true;
    });
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
      break;
    case "response.completed":
      console.log("Response fully completed.");
      break;
  }
}

function showMockResponse() {
  transcriptEl.innerHTML += `
    <div style="margin-top:10px;">
      <strong>1975 Corvette Headlight Motor</strong><br>
      Price: $120<br>
      <a href="https://example.com/1975-corvette-headlight-motor" target="_blank">
        View Part
      </a><br>
      <img src="https://via.placeholder.com/150" alt="Headlight Motor" style="margin-top:5px;">
    </div>
  `;
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

// --- Init ---
connectWS();

talkBtn.addEventListener("click", () => {
  console.log("Talk button pressed.");
  if (mockMode) showMockResponse();
  // Otherwise, start mic capture + send audio chunks to ws
});

stopBtn.addEventListener("click", () => {
  console.log("Stop button pressed.");
  // Stop mic recording, close WS if desired
});
