const talkButton = document.getElementById("talk-button");
const answerBox = document.getElementById("answer");

let mediaRecorder;
let ws;
let isRecording = false;
let textBuffer = "";

// Toggle button
talkButton.addEventListener("click", () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

async function startRecording() {
  talkButton.classList.add("speaking");
  answerBox.innerHTML += `<p><em>Listening...</em></p>`;
  isRecording = true;

  // Get session
  const resp = await fetch("/session", { method: "POST" });
  const { client_secret, model } = await resp.json();

  ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=${model}`, [
    "realtime",
    "openai-insecure-api-key." + client_secret,
    "openai-beta.realtime-v1"
  ]);

  ws.onopen = () => {
    console.log("Realtime connected");
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (e) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(e.data);
        }
      };

      mediaRecorder.start(250);
    });
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
      case "output_audio.delta":
        playAudio(msg.delta);
        break;
      case "output_text.delta":
        textBuffer += msg.delta;
        break;
      case "output_text.completed":
        renderText(textBuffer);
        textBuffer = "";
        break;
    }
  };

  ws.onclose = () => {
    console.log("WebSocket closed");
    cleanupMedia();
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
    cleanupMedia();
  };
}

function stopRecording() {
  talkButton.classList.remove("speaking");
  isRecording = false;
  cleanupMedia();
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  answerBox.innerHTML += `<p><em>Stopped</em></p>`;
}

function cleanupMedia() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  mediaRecorder = null;
}

// Append transcript or product card
function renderText(text) {
  try {
    const parsed = JSON.parse(text);
    if (parsed.name && parsed.url) {
      answerBox.innerHTML += `
        <div class="product-card">
          <img src="${parsed.image || ''}" alt="${parsed.name}"/>
          <p><strong>${parsed.name}</strong></p>
          <p>Price: ${parsed.price || 'N/A'}</p>
          <a href="${parsed.url}" target="_blank">View Product</a>
        </div>
      `;
    } else {
      answerBox.innerHTML += `<p>${text}</p>`;
    }
  } catch {
    answerBox.innerHTML += `<p>${text}</p>`;
  }
}

// Play audio
function playAudio(base64Data) {
  const audio = new Audio("data:audio/opus;base64," + base64Data);
  audio.play();
}
