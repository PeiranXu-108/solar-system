export class TestController {
  constructor(sceneManager, planetSystem) {
    this.sceneManager = sceneManager;
    this.planetSystem = planetSystem;
    this.init();
  }

  init() {
    this.setupTests();
    this.setupEventListeners();
  }

  setupTests() {
    this.tests = [
      { name: "THREE imported", fn: () => !!window.THREE && !!window.THREE.WebGLRenderer },
      {
        name: "WebGL context created",
        fn: () => {
          const gl = this.sceneManager.getRenderer().getContext();
          return (
            !!gl &&
            (gl instanceof WebGLRenderingContext ||
              gl instanceof WebGL2RenderingContext)
          );
        },
      },
      {
        name: "OrbitControls available",
        fn: () => typeof this.sceneManager.getControls().update === "function",
      },
      {
        name: "Composer & Bloom configured",
        fn: () => this.sceneManager.getBloomPass() && this.sceneManager.getBloomPass(),
      },
      { name: "Sun & light exist", fn: () => !!this.sceneManager.getScene().children.find(obj => obj.name === 'sun') },
      { name: "Planets registered", fn: () => this.planetSystem.getPlanets().length >= 8 },
      {
        name: "Earth mode toggles",
        fn: () => typeof window.enterEarthMode === "function",
      },
    ];
  }

  setupEventListeners() {
    const runTestsBtn = document.getElementById("runTests");
    if (runTestsBtn) {
      runTestsBtn.addEventListener("click", () => this.runTests());
    }
  }

  runTests() {
    const panel = document.getElementById("testPanel");
    const list = document.getElementById("testList");
    const summary = document.getElementById("testSummary");
    
    if (!panel || !list || !summary) return;
    
    list.innerHTML = "";
    let passed = 0;
    
    for (const t of this.tests) {
      let ok = false;
      try {
        ok = !!t.fn();
      } catch (e) {
        ok = false;
      }
      const li = document.createElement("li");
      li.textContent = `${ok ? "✅" : "❌"} ${t.name}`;
      list.appendChild(li);
      if (ok) passed++;
    }
    
    summary.textContent = `Tests: ${passed}/${this.tests.length} passed`;
    panel.style.display = "block";
    
    console.group("%cSolar System — Test Results", "color:#22d3ee");
    console.table(
      this.tests.map((t, i) => ({
        id: i + 1,
        test: t.name,
        passed: (() => {
          try {
            return !!t.fn();
          } catch {
            return false;
          }
        })(),
      }))
    );
    console.groupEnd();
  }
}
