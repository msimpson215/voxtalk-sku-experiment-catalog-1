<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>VoxTalk™</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="data:,">
  <style>
    body {
      margin:0; font-family:system-ui,sans-serif;
      display:grid; place-items:center; min-height:100vh;
      background: radial-gradient(circle at 50% 20%, #dbeafe, #93c5fd 40%, #1e3a8a 90%);
      position: relative;
    }
    .app { text-align:center; width:100%; max-width:420px; margin:0 auto; position:relative;}
    /* HEADER */
    .header-voxtalk {
      margin-top: 38px;
      font-size: 36px;
      font-weight: 900;
      color: #1e3a8a; /* dark blue */
      letter-spacing: 2px;
      text-shadow: 0 2px 10px #0001;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      position: relative;
    }
    .header-voxtalk .tm {
      font-size: 15px;
      margin-left: 2px;
      opacity: 0.8;
      vertical-align: super;
      position: relative;
      top: -10px;
      color: #3b82f6;
    }
    /* BUTTON */
    #pttBtn {
      margin-top: 52px;
      width:156px; height:156px;
      border-radius:50%; border:none; cursor:pointer;
      background: radial-gradient(circle at 30% 30%, #1e3a8a 68%, #3b82f6 100%);
      box-shadow:0 10px 32px rgba(37,99,235,.22);
      position: relative;
      display: block;
      margin-left: auto;
      margin-right: auto;
      z-index: 2;
      overflow: visible;
    }
    /* Exaggerated cloud effect: more puffs, more movement */
    .cloud-puff {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.95);
      opacity: 0.32;
      pointer-events: none;
      filter: blur(7px);
      z-index: 0;
      transition: opacity 0.18s;
    }
    /* Idle animation */
    #pttBtn:not(.speaking) .cloud-puff1 {
      width: 80px; height: 60px; left: 38px; top: 14px;
      animation: puffIdle1 4s ease-in-out infinite;
      opacity: 0.18;
      border-radius: 40px 40px 60px 60px / 50px 50px 60px 60px;
    }
    #pttBtn:not(.speaking) .cloud-puff2 {
      width: 44px; height: 44px; left: 100px; top: 66px;
      animation: puffIdle2 4.8s ease-in-out infinite;
      opacity: 0.13;
      border-radius: 28px 38px 40px 40px / 28px 38px 40px 40px;
    }
    #pttBtn:not(.speaking) .cloud-puff3 {
      width: 36px; height: 36px; left: 16px; top: 104px;
      animation: puffIdle3 5.2s ease-in-out infinite;
      opacity: 0.11;
      border-radius: 20px 32px 30px 30px / 20px 32px 30px 30px;
    }
    /* Speaking animation (EXAGGERATED) */
    #pttBtn.speaking .cloud-puff1 {
      width: 168px; height: 80px; left: -22px; top: -30px;
      animation: puffActive1 0.55s cubic-bezier(.68,-0.55,.27,1.55) infinite;
      opacity: 0.53;
      border-radius: 60px 100px 90px 80px / 60px 100px 80px 80px;
    }
    #pttBtn.speaking .cloud-puff2 {
      width: 90px; height: 90px; left: 120px; top: 110px;
      animation: puffActive2 0.66s cubic-bezier(.68,-0.55,.27,1.55) infinite;
      opacity: 0.40;
      border-radius: 60px 80px 90px 80px / 60px 80px 90px 80px;
    }
    #pttBtn.speaking .cloud-puff3 {
      width: 70px; height: 70px; left: -24px; top: 124px;
      animation: puffActive3 0.72s cubic-bezier(.68,-0.55,.27,1.55) infinite;
      opacity: 0.37;
      border-radius: 50px 70px 70px 60px / 50px 70px 70px 60px;
    }
    #pttBtn.speaking .cloud-puff4 {
      width: 80px; height: 80px; left: 60px; top: 150px;
      animation: puffActive4 0.82s cubic-bezier(.68,-0.55,.27,1.55) infinite;
      opacity: 0.31;
      border-radius: 50px 70px 70px 60px / 50px 70px 70px 60px;
    }
    @keyframes puffIdle1 {
      0%   { transform: scale(1) translateY(0px);}
      50%  { transform: scale(1.07) translateY(-6px);}
      100% { transform: scale(1) translateY(0px);}
    }
    @keyframes puffIdle2 {
      0%   { transform: scale(1) translateY(0px);}
      50%  { transform: scale(1.11) translateY(-8px);}
      100% { transform: scale(1) translateY(0px);}
    }
    @keyframes puffIdle3 {
      0%   { transform: scale(1) translateY(0px);}
      50%  { transform: scale(1.09) translateY(-7px);}
      100% { transform: scale(1) translateY(0px);}
    }
    @keyframes puffActive1 {
      0%   { transform: scale(1.01) translateY(0px);}
      33%  { transform: scale(1.55) translateY(-28px);}
      66%  { transform: scale(1.2) translateY(16px);}
      100% { transform: scale(1.01) translateY(0px);}
    }
    @keyframes puffActive2 {
      0%   { transform: scale(1.01) translateY(0px);}
      33%  { transform: scale(1.32) translateY(-20px);}
      66%  { transform: scale(1.17) translateY(10px);}
      100% { transform: scale(1.01) translateY(0px);}
    }
    @keyframes puffActive3 {
      0%   { transform: scale(1.01) translateY(0px);}
      33%  { transform: scale(1.21) translateY(-12px);}
      66%  { transform: scale(1.09) translateY(6px);}
      100% { transform: scale(1.01) translateY(0px);}
    }
    @keyframes puffActive4 {
      0%   { transform: scale(1.01) translateY(0px);}
      33%  { transform: scale(1.31) translateY(-18px);}
      66%  { transform: scale(1.13) translateY(8px);}
      100% { transform: scale(1.01) translateY(0px);}
    }
    #pttBtnLabel {
      position: relative;
      z-index: 2;
      font-size: 29px;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 2px 10px #000a;
      letter-spacing: 2px;
      user-select: none;
      pointer-events: none;
      top: 8px;
      border-radius: 24px;
      background: rgba(30,58,138,.14);
      padding: 8px 20px;
      display: inline-block;
    }
    #pttBtn.stopping #pttBtnLabel {
      color: #e11d48;
      text-shadow: 0 1px 8px #0006;
      opacity: 0.8;
      background: rgba(30,58,138,.16);
    }
    /* Responsive */
    @media(max-width:500px) {
      .app { max-width:99vw; }
      .header-voxtalk {font-size:23px;}
      #pttBtn { width:110px; height:110px; }
      #pttBtnLabel { font-size:20px; padding:6px 13px;}
      .cloud-puff { filter: blur(4px);}
    }
  </style>
</head>
<body>
  <div class="app">
    <div class="header-voxtalk">
      VoxTalk<span class="tm">™</span>
    </div>
    <!-- BLUE BUTTON: listening, speaking, stopping all in one -->
    <button id="pttBtn" aria-pressed="false">
      <!-- Exaggerated cloud puffs -->
      <span class="cloud-puff cloud-puff1"></span>
      <span class="cloud-puff cloud-puff2"></span>
      <span class="cloud-puff cloud-puff3"></span>
      <span class="cloud-puff cloud-puff4"></span>
      <span id="pttBtnLabel">TAP TO TALK</span>
    </button>
  </div>
  <script>
    const pttBtn   = document.getElementById('pttBtn');
    const pttBtnLabel = document.getElementById('pttBtnLabel);

    function setSpeaking(on) {
      if(on) pttBtn.classList.add('speaking');
      else pttBtn.classList.remove('speaking');
      pttBtnLabel.textContent = on ? "SPEAKING..." : "TAP TO TALK";
    }

    let talking = false;
    pttBtn.onclick = () => {
      talking = !talking;
      setSpeaking(talking);
    };

    // Start idle (not speaking)
    setSpeaking(false);
  </script>
</body>
</html>
