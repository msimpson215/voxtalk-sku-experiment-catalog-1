const talkBtn = document.getElementById('talk-button');
const stopBtn = document.getElementById('stop-button');
const answerEl = document.getElementById('answer');
const rtAudio = document.getElementById('remote');
const productCard = document.getElementById('product-card');

function appendLine(role, text) {
  if (answerEl.querySelector('.muted')) answerEl.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'line';
  div.innerHTML = `<strong>${role === 'me' ? 'You:' : 'AI:'}</strong> ${text}`;
  answerEl.appendChild(div);
  answerEl.scrollTop = answerEl.scrollHeight;
}

// Show structured product card
function renderProductCard(product) {
  productCard.style.display = 'block';
  productCard.innerHTML = `
    <img src="${product.image}" alt="${product.product}">
    <h3>${product.product}</h3>
    <p>${product.description}</p>
    <p><strong>Price:</strong> ${product.price}</p>
    <a href="${product.url}" target="_blank">View Product</a>
  `;
}

async function initRealtime() {
  try {
    const s = await fetch("/session", { method: "POST" });
    const { client_secret, model, voice } = await s.json();

    const pc = new RTCPeerConnection();
    const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    const micTrack = mic.getTracks()[0];
    micTrack.enabled = false;
    pc.addTrack(micTrack, mic);

    pc.ontrack = (ev) => {
      rtAudio.srcObject = ev.streams[0];
      rtAudio.play().catch(() => {});
    };

    const dc = pc.createDataChannel("events");
    let textBuffer = "";

    dc.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data);

        // Handle AI text output
        if (evt.type === "output_text.delta") {
          textBuffer += evt.delta;
        }
        if (evt.type === "output_text.completed") {
          console.log("Full text:", textBuffer);

          try {
            const parsed = JSON.parse(textBuffer);
            renderProductCard(parsed);
          } catch {
            appendLine("ai", textBuffer);
          }
          textBuffer = "";
        }

        // Handle AI audio output
        if (evt.type === "response.message.delta") {
          const chunk = evt.delta.map(d => d.content?.[0]?.text || "").join("");
          if (chunk) appendLine("ai", chunk);
        }
      } catch (err) {
        console.error("Event parse error:", err);
      }
    };

    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    await pc.setLocalDescription(offer);

    const r = await fetch(
      `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}&voice=${voice}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${client_secret.value}`,
          "Content-Type": "application/sdp"
        },
        body: offer.sdp
      }
    );
    const answer = { type: "answer", sdp: await r.text() };
    await pc.setRemoteDescription(answer);

    let talking = false;
    talkBtn.onclick = () => {
      talking = !talking;
      micTrack.enabled = talking;
      if (talking) {
        appendLine("me", "I need a headlight motor for a 1975 Corvette.");
      } else {
        appendLine("me", "(Stopped)");
      }
    };

    stopBtn.onclick = () => {
      talking = false;
      micTrack.enabled = false;
      appendLine("me", "(Stopped conversation)");
    };

  } catch (err) {
    console.error("Realtime init failed", err);
  }
}

initRealtime();
