export class LightsSticks {
  constructor(webgl, options) {
    this.webgl = webgl;
    this.options = options;
  }
  init() {
    const options = this.options;
    const geometry = new THREE.PlaneBufferGeometry(1, 1);
    let instanced = new THREE.InstancedBufferGeometry().copy(geometry);
    let totalSticks = options.totalSideLightSticks;
    instanced.maxInstancedCount = totalSticks;

    let stickoffset = options.length / (totalSticks - 1);
    const aOffset = [];
    const aColor = [];
    const aMetrics = [];

    let colors = options.colors.sticks;
    if (Array.isArray(colors)) {
      colors = colors.map((c) => new THREE.Color(c));
    } else {
      colors = new THREE.Color(colors);
    }

    for (let i = 0; i < totalSticks; i++) {
      let width = random(options.lightStickWidth);
      let height = random(options.lightStickHeight);
      aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());

      let color = pickRandom(colors);
      aColor.push(color.r);
      aColor.push(color.g);
      aColor.push(color.b);

      aMetrics.push(width);
      aMetrics.push(height);
    }
    instanced.addAttribute(
      'aOffset',
      new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false),
    );
    instanced.addAttribute(
      'aColor',
      new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false),
    );
    instanced.addAttribute(
      'aMetrics',
      new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false),
    );
    const material = new THREE.ShaderMaterial({
      fragmentShader: sideSticksFragment,
      vertexShader: sideSticksVertex,
      // This ones actually need double side
      side: THREE.DoubleSide,
      uniforms: Object.assign(
        {
          uTravelLength: new THREE.Uniform(options.length),
          uTime: new THREE.Uniform(0),
        },
        this.webgl.fogUniforms,
        options.distortion.uniforms,
      ),
    });

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <getDistortion_vertex>',
        options.distortion.getDistortion,
      );
    };

    const mesh = new THREE.Mesh(instanced, material);
    // The object is behind the camera before the vertex shader
    mesh.frustumCulled = false;
    // mesh.position.y = options.lightStickHeight / 2;
    this.webgl.scene.add(mesh);
    this.mesh = mesh;
  }
  update(time) {
    this.mesh.material.uniforms.uTime.value = time;
  }
}
