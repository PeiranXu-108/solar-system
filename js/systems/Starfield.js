import * as THREE from "three";

export class Starfield {
  constructor(scene) {
    this.scene = scene;
    this.stars = null;
    this.starMat = null;
    this.init();
  }

  init() {
    this.createStarfield();
  }

  createStarfield() {
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
    
    this.starMat = new THREE.ShaderMaterial({
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
    
    this.stars = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.stars);
  }

  update(dt) {
    this.starMat.uniforms.uTime.value += dt;
  }

  updatePixelRatio() {
    this.starMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }
}
