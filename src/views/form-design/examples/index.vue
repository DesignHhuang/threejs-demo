<template>
  <div class="energy-container" ref="energyContainerRef"></div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  /*  import { App } from '../flow/app'; */
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { carLightsFragment, carLightsVertex } from '.';

  const energyContainerRef = ref();

  const distortion_uniforms = {
    uDistortionX: new THREE.Uniform(new THREE.Vector2(80, 3)),
    uDistortionY: new THREE.Uniform(new THREE.Vector2(-40, 2.5)),
  };

  const distortion_vertex = `
      #define PI 3.14159265358979
      uniform vec2 uDistortionX;
      uniform vec2 uDistortionY;

      float nsin(float val){
        return sin(val) * 0.5+0.5;
      }
      vec3 getDistortion(float progress){
        progress = clamp(progress, 0.,1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        return vec3(
            xAmp * nsin(progress* PI * xFreq   - PI / 2. ) ,
            yAmp * nsin(progress * PI *yFreq - PI / 2.  ) ,
            0.
        );
      }
    `;

  const roadFragment = `
    varying vec2 vUv; 
    uniform vec3 uColor;
    uniform float uLanes;
    uniform vec3 uBrokenLinesColor;
    uniform vec3 uShoulderLinesColor;
    uniform float uShoulderLinesWidthPercentage;
    uniform float uBrokenLinesWidthPercentage;
    uniform float uBrokenLinesLengthPercentage;
    highp float random(vec2 co)
    {
        highp float a = 12.9898;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt= dot(co.xy ,vec2(a,b));
        highp float sn= mod(dt,3.14);
        return fract(sin(sn) * c);
    }
    void main() {
        vec2 uv = vUv;
        vec3 color = vec3(uColor);

        float brokenLineWidth = 1. / uLanes * uBrokenLinesWidthPercentage;
        // How much % of the lane's space is empty
        float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;

        // Horizontal * vertical offset
        float brokenLines = step(1.-brokenLineWidth * uLanes,fract(uv.x * uLanes)) * step(laneEmptySpace, fract(uv.y * 100.)) ;
        // Remove right-hand lines on the right-most lane
        brokenLines *= step(uv.x * uLanes,uLanes-1.);
        color = mix(color, uBrokenLinesColor, brokenLines);


        float shoulderLinesWidth = 1. / uLanes * uShoulderLinesWidthPercentage;
        float shoulderLines = step(1.-shoulderLinesWidth, uv.x) + step(uv.x, shoulderLinesWidth);
        color = mix(color, uBrokenLinesColor, shoulderLines);

        gl_FragColor = vec4(color,1.);
    }
  `;

  const roadVertex = `
uniform float uTravelLength;
varying vec2 vUv; 

void main() {
  vec3 transformed = position.xyz;
  
  vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
}`;

  const myCustomDistortion = {
    uniforms: distortion_uniforms,
    getDistortion: distortion_vertex,
  };

  const options = {
    length: 400,
    width: 20,
    roadWidth: 9,
    islandWidth: 2,
    lanesPerRoad: 3,
    lightPairsPerRoadWay: 50,
    //distortion: myCustomDistortion,

    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0xffffff,
      brokenLines: 0xffffff,
      /***  Only these colors can be an array ***/
      leftCars: [0xff5f73, 0xe74d60, 0xff102a],
      rightCars: [0xa4e3e6, 0x80d1d4, 0x53c2c6],
      sticks: 0xa4e3e6,
    },
  };

  const random = (base) => {
    if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
    return Math.random() * base;
  };

  const pickRandom = (arr) => {
    if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
    return arr;
  };

  onMounted(() => {
    //const myApp = new App(energyContainerRef.value, options);
    //console.log(myApp);
    //myApp.init();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, 1000 / 600, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(1000, 600, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    energyContainerRef.value.append(renderer.domElement);

    const roadGeometry = new THREE.PlaneGeometry(options.width, options.length, 20, 200);
    //const material = new THREE.MeshBasicMaterial({ color: 0xccc9e7 });
    let uniforms = {
      uTravelLength: new THREE.Uniform(options.length),
      uColor: new THREE.Uniform(new THREE.Color(0xccc9e7)),
      uLanes: new THREE.Uniform(options.lanesPerRoad), // 每条路的车道数量
      uBrokenLinesColor: new THREE.Uniform(new THREE.Color(options.colors.brokenLines)),
      uShoulderLinesColor: new THREE.Uniform(new THREE.Color(options.colors.shoulderLines)),
      uShoulderLinesWidthPercentage: new THREE.Uniform(0.05),
      uBrokenLinesLengthPercentage: new THREE.Uniform(0.5),
      uBrokenLinesWidthPercentage: new THREE.Uniform(0.1),
    };
    const roadMaterial = new THREE.ShaderMaterial({
      fragmentShader: roadFragment,
      vertexShader: roadVertex,
      side: THREE.DoubleSide,
      uniforms: uniforms,
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);

    //roadMesh.rotation.x = -Math.PI / 2; // 弧度，转为角度相当于90度
    roadMesh.position.z = -options.length / 2;

    scene.add(roadMesh);

    /* camera.position.z = 5;
    camera.position.y = 2;
    camera.position.x = 0; */

    const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1));
    const baseGeometry: any = new THREE.TubeGeometry(curve, 40, 1, 8, false);
    const instanced = new THREE.InstancedBufferGeometry().copy(baseGeometry);
    instanced.instanceCount = options.lightPairsPerRoadWay * 2; // 一辆车两个灯，显示两条灯带

    // 偏移量
    let aOffset: any[] = [];
    let aMetrics: any[] = [];
    let aColor: any[] = [];

    // 车道的宽度  路宽除以车道数
    let laneWidth = options.roadWidth / options.lanesPerRoad;
    // 共50对
    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      let radius = random([0.05, 0.14]);
      let length = random([400 * 0.05, 400 * 0.15]);

      let carLane = i % 3; // 0，1，2
      //  Get its lane's centered position
      let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;

      let carWidth = random([0.3, 0.5]) * laneWidth;

      let carShiftX = random([-0.2, 0.2]) * laneWidth;
      laneX += carShiftX;

      let offsetY = random([0, 5]) + radius * 1.3;
      let offsetZ = -random(options.length);

      aOffset.push(laneX - carWidth / 2);
      aOffset.push(offsetY);
      aOffset.push(offsetZ);

      aOffset.push(laneX + carWidth / 2);
      aOffset.push(offsetY);
      aOffset.push(offsetZ);

      aMetrics.push(radius);
      aMetrics.push(length);

      let color = pickRandom(options.colors.leftCars);
      aColor.push(color.r);
      aColor.push(color.g);
      aColor.push(color.b);

      aColor.push(color.r);
      aColor.push(color.g);
      aColor.push(color.b);
    }

    instanced.setAttribute(
      'aOffset',
      new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false),
    );
    instanced.setAttribute(
      'aMetrics',
      new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false),
    );
    instanced.setAttribute(
      'aColor',
      new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false),
    );

    const lignhtMaterial = new THREE.ShaderMaterial({
      fragmentShader: carLightsFragment,
      vertexShader: carLightsVertex,
      transparent: true,
      uniforms: Object.assign({
        uTravelLength: new THREE.Uniform(options.length),
      }),
    });

    const lignhtMesh = new THREE.Mesh(instanced, lignhtMaterial);
    lignhtMesh.frustumCulled = false;
    scene.add(lignhtMesh);

    renderer.render(scene, camera);

    const controls = new OrbitControls(camera, renderer.domElement);

    // 动画循环
    function animate() {
      requestAnimationFrame(animate);

      // 需要更新控制器
      controls.update();

      renderer.render(scene, camera);
    }
    animate();
    //renderer.setAnimationLoop(animate);

    /* const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      renderer.setSize(1000, 600, false);
      renderer.setPixelRatio(window.devicePixelRatio);
      energyContainerRef.value.append(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(45, 1000 / 600, 0.1, 10000);
      const scene = new THREE.Scene();

      const geometry = new THREE.PlaneGeometry(20, 400, 20, 200);
   */
    /* const material = new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          //uColor: new THREE.Uniform(new THREE.Color(0x101012)),
          uColor: new THREE.Uniform(new THREE.Color(0x071749)),
        },
      }); */
    /* const material = new THREE.MeshBasicMaterial({ color: 0x071749 });

      const mesh = new THREE.Mesh(geometry, material);

      const light = new THREE.AmbientLight(0x404040); */

    /*  scene.add(light);
      scene.add(mesh);

      renderer.render(scene, camera); */

    //myApp.loadAssets().then(myApp.init);
  });
</script>

<style lang="less" scoped>
  .energy-container {
    margin-top: 40px;
    margin-left: 40px;
    width: 1000px;
    height: 600px;
  }
</style>
