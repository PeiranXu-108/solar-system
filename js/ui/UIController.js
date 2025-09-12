export class UIController {
  constructor(sceneManager, planetSystem, interactionController) {
    this.sceneManager = sceneManager;
    this.planetSystem = planetSystem;
    this.interactionController = interactionController;
    this.timeScale = 1.0;
    this.paused = false;
    this.init();
  }

  init() {
    this.setupUIElements();
    this.setupEventListeners();
  }

  setupUIElements() {
    this.speedEl = document.getElementById("speed");
    this.bloomEl = document.getElementById("bloom");
    this.toggleEl = document.getElementById("toggle");
    this.runTestsBtn = document.getElementById("runTests");
    this.focusEarthBtn = document.getElementById("focusEarth");
    this.audioBtn = document.getElementById("audioBtn");
    this.audioFile = document.getElementById("audioFile");
    this.earthModeBtn = document.getElementById("earthMode");
    this.solarModeBtn = document.getElementById("solarMode");
    
    this.timeScale = parseFloat(this.speedEl.value);
  }

  setupEventListeners() {
    this.speedEl.addEventListener("input", () => {
      this.timeScale = parseFloat(this.speedEl.value);
    });

    this.bloomEl.addEventListener("input", () => {
      this.sceneManager.getBloomPass().strength = parseFloat(this.bloomEl.value);
    });

    this.toggleEl.addEventListener("click", () => {
      this.paused = !this.paused;
      this.toggleEl.textContent = this.paused ? "▶️ Play" : "⏯️ Pause";
    });

    this.focusEarthBtn.addEventListener("click", () => {
      this.interactionController.focusEarth();
    });

    this.audioBtn.addEventListener("click", () => {
      this.audioFile.click();
    });

    this.audioFile.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (f) this.setupAudio(f);
    });
  }

  setupAudio(file) {
    if (this.audioCtx) this.audioCtx.close();
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.loop = true;
    audio.play();
    const src = this.audioCtx.createMediaElementSource(audio);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    src.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  getBeat() {
    if (!this.analyser) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < 32 && i < this.dataArray.length; i++) sum += this.dataArray[i];
    return sum / (32 * 255);
  }

  getTimeScale() {
    return this.timeScale;
  }

  isPaused() {
    return this.paused;
  }

  getAnalyser() {
    return this.analyser;
  }
}
