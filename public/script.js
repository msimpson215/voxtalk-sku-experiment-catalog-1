let pc, ws;
const talkButton = document.getElementById("talk-button");
const stopButton = document.getElementById("stop-button");
const transcriptBox = document.getElementById("transcript-box");

async function initRealtime() {
  try {
    const resp = await fetch("/session", { method: "POST" });
    const data = await resp.json();
    console.log("Session data:", data);

    if (data.error) {
      transcriptBox.innerHTML = "Session error: " + JSON.stringify(data.error);
      return;
    }

    // --- WebRTC setup ---
    pc = new RTCPeerConnection();

    // Audio output
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    pc.ontrack = (event) => {
      audioEl.srcObject = event.streams[0];
    };

    // Mic input
    const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
    ms.getTracks().forEach((t) => pc.addTrack(t, ms));

    // WebSocket signaling
    ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=${data.model}`, [
      "realtime",
      `openai-insecure-api-key.${data.client_secret.value}`,
      "openai-beta.realtime-v1"
    ]);

    ws.onopen = async () => {
      console.log("WebSocket connected");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: "offer", sdp: offer.sdp }));
    };

    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "answer") {
        await pc.setRemoteDescription({ type: "answer", sdp: msg.sdp });
      }

      if (msg.type === "output_text.delta") {
        transcriptBox.innerHTML += msg.delta;
      }
      if (msg.type === "output_text.completed") {
        transcriptBox.innerHTML += "<br/>";
      }
    };

    ws.onclose = () => console.log("WebSocket closed");
  } catch (err) {
    console.error("Realtime init failed", err);
    transcriptBox.innerHTML = "Realtime init failed: " + err;
  }
}

talkButton.onclick = () => initRealtime();
stopButton.onclick = () => {
  if (ws) ws.close();
  if (pc) pc.close();
};
