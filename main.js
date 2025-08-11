import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { Lensflare, LensflareElement } from "three/addons/objects/Lensflare.js";

// ---------- Renderer & Scene ----------
const container = document.getElementById("app");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.25;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070c, 0.0008);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(0, 120, 330);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.minDistance = 60;
controls.maxDistance = 1200;

// ---------- Post Processing ----------
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.9,
  0.8,
  0.02
);
composer.addPass(renderPass);
composer.addPass(bloomPass);

// ---------- Texture bases (reliable CDN) ----------
const TEX_BASE =
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r161/examples/textures/";
const PLANET = TEX_BASE + "planets/";
const SPRITE = TEX_BASE + "sprites/";
const LENS = TEX_BASE + "lensflare/";
const IMG_BASE = "static/planets/"

// ---------- Starfield ----------
const starGeo = new THREE.BufferGeometry();
const starCount = 8000;
const positions = new Float32Array(starCount * 3);
const sizes = new Float32Array(starCount);
for (let i = 0; i < starCount; i++) {
  const r = THREE.MathUtils.randFloat(600, 2000);
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(THREE.MathUtils.randFloatSpread(2));
  positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
  positions[i * 3 + 1] = r * Math.cos(ph) * 0.4;
  positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  sizes[i] = Math.random() * 2.5 + 0.5;
}
starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
starGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
const starMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  },
  vertexShader: `attribute float aSize; uniform float uPixelRatio; varying float vTw; void main(){ vTw = fract(sin(dot(position.xyz, vec3(12.9898,78.233,37.719))) * 43758.5453); vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPixelRatio * (80.0 / -mv.z); gl_PointSize = max(gl_PointSize, 1.0); }`,
  fragmentShader: `varying float vTw; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.2,0.5-d); float tw = smoothstep(0.0,1.0,vTw); gl_FragColor = vec4(vec3(0.75+tw*0.25), a*(0.6+0.4*tw)); }`,
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// ---------- Lighting ----------
const ambient = new THREE.AmbientLight(0x223355, 0.55);
scene.add(ambient);
const hemi = new THREE.HemisphereLight(0x324055, 0x000000, 0.35);
scene.add(hemi);
const sunLight = new THREE.PointLight(0xffe9a6, 3.2, 0, 2);
sunLight.castShadow = false;
scene.add(sunLight);
// lens flare
const flare0 = new THREE.TextureLoader().load(LENS + "lensflare0.png");
const flare3 = new THREE.TextureLoader().load(LENS + "lensflare3.png");
const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(flare0, 300, 0));
lensflare.addElement(new LensflareElement(flare3, 60, 0.6));
lensflare.addElement(new LensflareElement(flare3, 40, 0.7));
sunLight.add(lensflare);

// ---------- Sun ----------
const texLoader = new THREE.TextureLoader();
const loadColorTex = (url) => {
  const t = texLoader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const sunTex = loadColorTex(IMG_BASE + "2k_sun.jpg");
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(18, 64, 64),
  new THREE.MeshBasicMaterial({ map: sunTex })
);
scene.add(sun);
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: texLoader.load(SPRITE + "glow.png"),
    color: 0xffc266,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  })
);
glow.scale.set(150, 150, 1);
sun.add(glow);
sun.material.color.set(0xffa500); // 设为更暗的橙色
sunLight.intensity = 1.0; // 降低光源强度
// cinematic nebulas
const nebulaTex = texLoader.load(LENS + "lensflare0.png");
const nebulas = [];
for (let i = 0; i < 4; i++) {
  const sm = new THREE.SpriteMaterial({
    map: nebulaTex,
    color: 0x66aaff,
    transparent: true,
    opacity: 0.05,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sp = new THREE.Sprite(sm);
  sp.scale.setScalar(800 + Math.random() * 400);
  sp.position.set(
    THREE.MathUtils.randFloatSpread(1200),
    THREE.MathUtils.randFloatSpread(200),
    THREE.MathUtils.randFloatSpread(1200)
  );
  nebulas.push(sp);
  scene.add(sp);
}

// ---------- Utility ----------
const makeOrbit = (radius, tilt = 0) => {
  const g = new THREE.BufferGeometry();
  const seg = 256;
  const v = [];
  for (let i = 0; i <= seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    v.push(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  const m = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.6,
  });
  const loop = new THREE.LineLoop(g, m);
  loop.rotation.x = tilt;
  return loop;
};

// ---------- Planet Factory ----------
const planets = [];
const addPlanet = ({
  name,
  radius,
  distance,
  orbitSpeed,
  rotationSpeed,
  texture,
  normalMap,
  ring,
  orbitInclination = 0,
  axialTilt = 0,
}) => {
  const group = new THREE.Group();
  scene.add(group);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    new THREE.MeshStandardMaterial({
      map: texture ? loadColorTex(texture) : null,
      color: 0xffffff,
      metalness: 0.0,
      roughness: 1.0,
    })
  );
  // mesh.material.emissive = new THREE.Color(0xffffff);
  // mesh.material.emissiveIntensity = 0.5;
  if (normalMap) mesh.material.normalMap = texLoader.load(normalMap);
  const pivot = new THREE.Group();
  pivot.rotation.x = orbitInclination;
  group.add(pivot);
  const holder = new THREE.Group();
  holder.position.x = distance;
  pivot.add(holder);
  mesh.rotation.z = axialTilt;
  holder.add(mesh);
  const orbit = makeOrbit(distance, orbitInclination);
  group.add(orbit);
  const label = document.createElement("div");
  label.className = "label";
  label.textContent = name;
  document.body.appendChild(label);
  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.inner, ring.outer, 128, 1);
    const ringMat = new THREE.MeshBasicMaterial({
      map: loadColorTex(ring.texture),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(mesh.position);
    holder.add(ringMesh);
  }
  planets.push({
    name,
    pivot,
    holder,
    mesh,
    label,
    distance,
    orbitSpeed,
    rotationSpeed,
    orbitInclination,
    axialTilt,
  });
};

// ---------- Create Planets ----------
addPlanet({
  name: "Mercury",
  radius: 2,
  distance: 30,
  orbitSpeed: 4.8,
  rotationSpeed: 0.01,
  texture: IMG_BASE + "2k_mercury.jpg",
  orbitInclination: THREE.MathUtils.degToRad(7),
  axialTilt: THREE.MathUtils.degToRad(0.03),
});
addPlanet({
  name: "Venus",
  radius: 3.5,
  distance: 42,
  orbitSpeed: 3.5,
  rotationSpeed: 0.008,
  texture: IMG_BASE + "2k_venus_surface.jpg",
  orbitInclination: THREE.MathUtils.degToRad(3.4),
  axialTilt: THREE.MathUtils.degToRad(177),
});
addPlanet({
  name: "Earth",
  radius: 3.8,
  distance: 58,
  orbitSpeed: 3.0,
  rotationSpeed: 0.03,
  texture: PLANET + "earth_atmos_2048.jpg",
  normalMap: PLANET + "earth_normal_2048.jpg",
  orbitInclination: 0,
  axialTilt: THREE.MathUtils.degToRad(23.4),
});
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 32, 32),
  new THREE.MeshStandardMaterial({
    map: loadColorTex(PLANET + "moon_1024.jpg"),
    roughness: 1,
  })
);
const earthRef = () => planets.find((p) => p.name === "Earth");
const moonPivot = new THREE.Group();
addPlanet({
  name: "Mars",
  radius: 3.0,
  distance: 74,
  orbitSpeed: 2.4,
  rotationSpeed: 0.024,
  texture: IMG_BASE + "2k_mars.jpg",
  orbitInclination: THREE.MathUtils.degToRad(1.85),
  axialTilt: THREE.MathUtils.degToRad(25.2),
});
const belt = (() => {
  const g = new THREE.BufferGeometry();
  const n = 5000;
  const pos = new Float32Array(n * 3);
  const rMin = 90,
    rMax = 130;
  for (let i = 0; i < n; i++) {
    const r = THREE.MathUtils.lerp(rMin, rMax, Math.random());
    const t = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(t) * r + THREE.MathUtils.randFloatSpread(2);
    pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(1.2);
    pos[i * 3 + 2] = Math.sin(t) * r + THREE.MathUtils.randFloatSpread(2);
  }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({
    size: 0.7,
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.9,
  });
  const pts = new THREE.Points(g, m);
  scene.add(pts);
  return pts;
})();
addPlanet({
  name: "Jupiter",
  radius: 11.5,
  distance: 160,
  orbitSpeed: 1.6,
  rotationSpeed: 0.05,
  texture: IMG_BASE + "2k_jupiter.jpg",
  orbitInclination: THREE.MathUtils.degToRad(1.3),
  axialTilt: THREE.MathUtils.degToRad(3.1),
});
addPlanet({
  name: "Saturn",
  radius: 9.8,
  distance: 210,
  orbitSpeed: 1.2,
  rotationSpeed: 0.04,
  texture: IMG_BASE +  "2K_saturn.jpg",
  ring: { inner: 14, outer: 22, texture: PLANET + "saturnring.png" },
  orbitInclination: THREE.MathUtils.degToRad(2.5),
  axialTilt: THREE.MathUtils.degToRad(26.7),
});
addPlanet({
  name: "Uranus",
  radius: 7.2,
  distance: 260,
  orbitSpeed: 0.9,
  rotationSpeed: 0.03,
  texture: IMG_BASE + "2k_uranus.jpg",
  orbitInclination: THREE.MathUtils.degToRad(0.8),
  axialTilt: THREE.MathUtils.degToRad(97.8),
});
addPlanet({
  name: "Neptune",
  radius: 7.0,
  distance: 300,
  orbitSpeed: 0.7,
  rotationSpeed: 0.03,
  texture: IMG_BASE + "2k_neptune.jpg",
  orbitInclination: THREE.MathUtils.degToRad(1.8),
  axialTilt: THREE.MathUtils.degToRad(28.3),
});

// ---------- UI ----------
const speedEl = document.getElementById("speed");
const bloomEl = document.getElementById("bloom");
const toggleEl = document.getElementById("toggle");
const runTestsBtn = document.getElementById("runTests");
const focusEarthBtn = document.getElementById("focusEarth");
const infoCard = document.getElementById("infoCard");
const cardTitle = document.getElementById("cardTitle");
const cardBody = document.getElementById("cardBody");
const audioBtn = document.getElementById("audioBtn");
const audioFile = document.getElementById("audioFile");
const earthModeBtn = document.getElementById("earthMode");
const solarModeBtn = document.getElementById("solarMode");
let timeScale = parseFloat(speedEl.value);
let paused = false;
let earthClouds = null,
  earthAtmo = null,
  earthNight = null;

speedEl.addEventListener("input", () => {
  timeScale = parseFloat(speedEl.value);
});
bloomEl.addEventListener("input", () => {
  bloomPass.strength = parseFloat(bloomEl.value);
});
toggleEl.addEventListener("click", () => {
  paused = !paused;
  toggleEl.textContent = paused ? "▶️ Play" : "⏯️ Pause";
});

// ---------- Interactions ----------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentTarget = null;
function setInfoCard(p) {
  cardTitle.textContent = p.name;
  const period = (2 * Math.PI) / (p.orbitSpeed * 0.02);
  cardBody.innerHTML = `Distance: ${
    p.distance
  } (scaled)<br/>Orbit inc.: ${THREE.MathUtils.radToDeg(
    p.orbitInclination
  ).toFixed(1)}°<br/>Axial tilt: ${THREE.MathUtils.radToDeg(
    p.axialTilt
  ).toFixed(1)}°<br/>Approx. period: ${period.toFixed(1)}s (sim)`;
  infoCard.style.display = "block";
}
function flyToPlanet(p) {
  const worldPos = new THREE.Vector3();
  p.holder.getWorldPosition(worldPos);
  const dir = worldPos.clone().sub(controls.target).normalize();
  const camStart = camera.position.clone();
  const camEnd = worldPos
    .clone()
    .add(dir.multiplyScalar(p.mesh.geometry.parameters.radius * 8 + 20));
  const targetStart = controls.target.clone();
  const targetEnd = worldPos.clone();
  let k = 0;
  const dur = 1.6;
  const ease = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
  (function step() {
    k += 1 / 60;
    const e = ease(Math.min(1, k / dur));
    camera.position.lerpVectors(camStart, camEnd, e);
    controls.target.lerpVectors(targetStart, targetEnd, e);
    if (e < 1) requestAnimationFrame(step);
  })();
  setInfoCard(p);
  currentTarget = p;
}
function onPointerDown(ev) {
  mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const meshes = planets.map((p) => p.mesh);
  const inter = raycaster.intersectObjects(meshes, false)[0];
  if (inter) {
    const p = planets.find((pp) => pp.mesh === inter.object);
    flyToPlanet(p);
  } else {
    infoCard.style.display = "none";
    currentTarget = null;
  }
}
window.addEventListener("pointerdown", onPointerDown);
focusEarthBtn.addEventListener("click", () => {
  const e = planets.find((p) => p.name === "Earth");
  if (e) flyToPlanet(e);
});

// ---------- Earth Mode (realistic Earth: day/night + clouds + atmosphere) ----------
function makeAtmosphere(radius) {
  const atmoGeo = new THREE.SphereGeometry(radius * 1.03, 64, 64);
  const atmoMat = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: 0.35 },
      p: { value: 2.2 },
      glowColor: { value: new THREE.Color(0x4fa8ff) },
      viewVector: { value: camera.position },
    },
    vertexShader: `uniform vec3 viewVector; varying float intensity; void main(){ vec3 vNormal = normalize(normalMatrix * normal); vec3 vNormel = normalize(normalMatrix * (modelViewMatrix * vec4(position,1.0)).xyz); intensity = pow(0.6 - dot(vNormal, normalize(viewVector - (modelMatrix * vec4(position,1.0)).xyz)), 2.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 glowColor; varying float intensity; void main(){ gl_FragColor = vec4(glowColor, intensity*0.9); }`,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });
  return new THREE.Mesh(atmoGeo, atmoMat);
}

function enterEarthMode() {
  const earth = earthRef();
  if (!earth) return;
  planets.forEach((p) => {
    if (p.name !== "Earth") {
      p.pivot.visible = false;
      p.label.style.display = "none";
    }
  });
  belt.visible = false;
  // rich earth material with specular/normal/emissive (city lights)
  const spec = texLoader.load(PLANET + "earth_specular_2048.jpg");
  spec.colorSpace = THREE.LinearSRGBColorSpace;
  const lights = texLoader.load(PLANET + "earth_lights_2048.png");
  lights.colorSpace = THREE.SRGBColorSpace;
  const normal = texLoader.load(PLANET + "earth_normal_2048.jpg");
  earth.mesh.material = new THREE.MeshPhongMaterial({
    map: loadColorTex(PLANET + "earth_atmos_2048.jpg"),
    specularMap: spec,
    normalMap: normal,
    shininess: 18,
    emissiveMap: lights,
    emissive: new THREE.Color(0x111133),
    emissiveIntensity: 0.55,
  });
  // clouds
  if (!earthClouds) {
    const cloudsTex = texLoader.load(PLANET + "earth_clouds_2048.png");
    cloudsTex.colorSpace = THREE.SRGBColorSpace;
    earthClouds = new THREE.Mesh(
      new THREE.SphereGeometry(
        earth.mesh.geometry.parameters.radius * 1.02,
        64,
        64
      ),
      new THREE.MeshLambertMaterial({
        map: cloudsTex,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    );
    earth.holder.add(earthClouds);
  }
  // atmosphere
  if (!earthAtmo) {
    earthAtmo = makeAtmosphere(earth.mesh.geometry.parameters.radius);
    earth.holder.add(earthAtmo);
  }
  // camera move in
  flyToPlanet(earth);
  earthModeBtn.style.display = "none";
  solarModeBtn.style.display = "inline-block";
}

function exitEarthMode() {
  planets.forEach((p) => {
    p.pivot.visible = true;
    p.label.style.display = "";
  });
  belt.visible = true;
  const earth = earthRef();
  if (earth) {
    // restore simpler material
    earth.mesh.material = new THREE.MeshStandardMaterial({
      map: loadColorTex(PLANET + "earth_atmos_2048.jpg"),
      normalMap: texLoader.load(PLANET + "earth_normal_2048.jpg"),
      metalness: 0,
      roughness: 1,
    });
  }
  earthModeBtn.style.display = "inline-block";
  solarModeBtn.style.display = "none";
  infoCard.style.display = "none";
}

earthModeBtn.addEventListener("click", enterEarthMode);
solarModeBtn.addEventListener("click", exitEarthMode);

// ---------- Resize ----------
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  starMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
}
window.addEventListener("resize", onResize);

// ---------- Labels ----------
const tempV = new THREE.Vector3();
function updateLabels() {
  for (const p of planets) {
    tempV.copy(p.holder.position).applyMatrix4(p.pivot.matrixWorld);
    tempV.project(camera);
    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-tempV.y * 0.5 + 0.5) * window.innerHeight;
    p.label.style.transform = `translate(${x}px, ${y}px)`;
    const inView = tempV.z < 1 && tempV.z > -1;
    p.label.style.opacity = inView ? "1" : "0";
  }
}

// ---------- Audio sync ----------
let analyser = null,
  dataArray = null,
  audioCtx = null;
function setupAudio(file) {
  if (audioCtx) audioCtx.close();
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audio = new Audio();
  audio.src = URL.createObjectURL(file);
  audio.loop = true;
  audio.play();
  const src = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  src.connect(analyser);
  analyser.connect(audioCtx.destination);
  dataArray = new Uint8Array(analyser.frequencyBinCount);
}
function getBeat() {
  if (!analyser) return 0;
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (let i = 0; i < 32 && i < dataArray.length; i++) sum += dataArray[i];
  return sum / (32 * 255);
}
document
  .getElementById("audioBtn")
  .addEventListener("click", () =>
    document.getElementById("audioFile").click()
  );
document.getElementById("audioFile").addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (f) setupAudio(f);
});

// ---------- Animation ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const beat = getBeat();
  if (!paused) {
    const t = dt * timeScale;
    stars.rotation.y += t * 0.005;
    sun.rotation.y += t * 0.02;
    for (const p of planets) {
      p.pivot.rotation.y += t * (p.orbitSpeed * 0.02);
      p.mesh.rotation.y += t * p.rotationSpeed;
    }
    belt.rotation.y += t * 0.0015;
    if (earthClouds) earthClouds.rotation.y += t * 0.02;
    starMat.uniforms.uTime.value += dt;
    if (!moon.parent && earthRef()?.holder) {
      const earthHolder = earthRef().holder;
      moonPivot.rotation.x = 0.45;
      earthHolder.add(moonPivot);
      moon.position.x = 8;
      moonPivot.add(moon);
    }
    if (moonPivot.parent) {
      moonPivot.rotation.y += t * 0.8;
      moon.rotation.y += t * 0.4;
    }
  }
  if (analyser) {
    bloomPass.strength = 0.8 + beat * 0.8;
    nebulas.forEach((n) => (n.material.opacity = 0.03 + beat * 0.12));
  }
  controls.update();
  updateLabels();
  composer.render();
}
animate();

// ---------- Intro dolly ----------
(async () => {
  await new Promise((r) => setTimeout(r, 400));
  const target = new THREE.Vector3(0, 0, 0);
  let k = 0;
  const dur = 2.6;
  const start = camera.position.clone();
  const end = new THREE.Vector3(0, 90, 250);
  const ease = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
  (function tick() {
    k += 1 / 60;
    const e = ease(Math.min(1, k / dur));
    camera.position.lerpVectors(start, end, e);
    controls.target.lerpVectors(controls.target.clone(), target, e);
    if (e < 1) requestAnimationFrame(tick);
  })();
})();

// ---------- Tests ----------
const tests = [
  { name: "THREE imported", fn: () => !!THREE && !!THREE.WebGLRenderer },
  {
    name: "WebGL context created",
    fn: () => {
      const gl = renderer.getContext();
      return (
        !!gl &&
        (gl instanceof WebGLRenderingContext ||
          gl instanceof WebGL2RenderingContext)
      );
    },
  },
  {
    name: "OrbitControls available",
    fn: () => typeof controls.update === "function",
  },
  {
    name: "Composer & Bloom configured",
    fn: () => composer && bloomPass && composer.passes.includes(bloomPass),
  },
  { name: "Sun & light exist", fn: () => !!sun && !!sunLight },
  { name: "Planets registered", fn: () => planets.length >= 8 },
  {
    name: "Earth mode toggles",
    fn: () => typeof enterEarthMode === "function",
  },
];
function runTests() {
  const panel = document.getElementById("testPanel");
  const list = document.getElementById("testList");
  const summary = document.getElementById("testSummary");
  list.innerHTML = "";
  let passed = 0;
  for (const t of tests) {
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
  summary.textContent = `Tests: ${passed}/${tests.length} passed`;
  panel.style.display = "block";
  console.group("%cSolar System — Test Results", "color:#22d3ee");
  console.table(
    tests.map((t, i) => ({
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
document.getElementById("runTests").addEventListener("click", runTests);
