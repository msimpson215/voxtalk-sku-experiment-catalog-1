body {
  margin: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 20%, #dbeafe 10%, #93c5fd 40%, #1e3a8a 90%);
  font-family: system-ui, sans-serif;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 80%;
  max-width: 700px;
}

#talk-button {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle at 60% 60%, #2563eb 65%, #1e40af 100%);
  border: none;
  outline: none;
  cursor: pointer;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.label {
  position: relative;
  z-index: 2;
  opacity: 0.85;
}

.halo {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid rgba(59, 130, 246, 0.7);
  opacity: 0;
  animation: pulse 1.5s infinite;
  pointer-events: none;
}

#talk-button.speaking .halo {
  opacity: 1;
}

.halo:nth-child(2) { animation-delay: 0.3s; }
.halo:nth-child(3) { animation-delay: 0.6s; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(1.5); opacity: 0; }
}

#answer {
  background: rgba(255, 255, 255, 0.9);
  color: #111;
  border-radius: 12px;
  padding: 15px;
  min-height: 80px;
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  font-size: 1rem;
  line-height: 1.5;
}

.product-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 10px 0;
  padding: 10px;
  background: #f9fafb;
}

.product-card img {
  max-width: 120px;
  border-radius: 4px;
  margin-bottom: 8px;
}
