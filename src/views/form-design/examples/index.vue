<template>
  <div>
    <div class="energy-container" ref="energyContainerRef"></div>
    <div class="absolute top-0 left-0 flex energy-container">
      <div class="w-full h-full" id="view1" tabindex="1"></div>
      <div class="w-full h-full" id="view2" tabindex="2"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  /*  import { App } from '../flow/app'; */
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { carLightsFragment, carLightsVertex } from '.';
  import { EffectComposer } from 'postprocessing';

  const energyContainerRef = ref();
  const renderer = ref();

  const clock = new THREE.Clock();

  const speedUp = ref(0);
  const speedUpTarget = ref(0);
  const timeOffset = ref(0);

  function setScissorForElement(elem) {
    const canvasRect = energyContainerRef.value.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    // 计算canvas的尺寸
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);

    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);

    // 设置剪函数以仅渲染一部分场景
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.value.setScissor(left, positiveYUpBottom, width, height);
    renderer.value.setViewport(left, positiveYUpBottom, width, height);

    // 返回aspect
    return width / height;
  }

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
      leftCars: [0xe54666, 0x0090ff, 0xffe629],
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

  function lerp(current, target, speed = 0.1, limit = 0.001) {
    let change = (target - current) * speed;
    if (Math.abs(change) < limit) {
      change = target - current;
    }
    return change;
  }

  const uTime = ref(new THREE.Uniform(0));

  onMounted(() => {
    //const myApp = new App(energyContainerRef.value, options);
    //console.log(myApp);
    //myApp.init();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, 800 / 600, 0.1, 500);
    const cameraHelper = new THREE.CameraHelper(camera);
    scene.add(cameraHelper);

    const view1Elem: any = document.querySelector('#view1');
    const view2Elem: any = document.querySelector('#view2');

    renderer.value = new THREE.WebGLRenderer();
    renderer.value.setSize(1600, 600, false);
    renderer.value.setPixelRatio(window.devicePixelRatio);

    energyContainerRef.value.append(renderer.value.domElement);

    const roadGeometry = new THREE.PlaneGeometry(options.width, options.length, 20, 200);
    //const material = new THREE.MeshBasicMaterial({ color: 0xccc9e7 });
    let uniforms = {
      uTravelLength: new THREE.Uniform(options.length),
      uColor: new THREE.Uniform(new THREE.Color(0xccc9e7)),
      uTime: uTime.value,
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

    roadMesh.rotation.x = -Math.PI / 2; // 弧度，转为角度相当于90度
    roadMesh.position.z = -options.length / 2;

    scene.add(roadMesh);

    camera.position.set(0, 8, -5);

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

    let colors: any[] = options.colors.leftCars.map((c) => new THREE.Color(c));

    // 共50对
    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      let radius = random([0.05, 0.14]);
      let length = random([400 * 0.05, 400 * 0.15]);
      let speed = random([60, 80]);

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
      aMetrics.push(speed);

      aMetrics.push(radius);
      aMetrics.push(length);
      aMetrics.push(speed);

      let color = pickRandom(colors);
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
      new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false),
    );
    instanced.setAttribute(
      'aColor',
      new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false),
    );

    const lignhtMaterial = new THREE.ShaderMaterial({
      fragmentShader: carLightsFragment,
      vertexShader: carLightsVertex,
      //transparent: true,
      uniforms: Object.assign({
        uTime: new THREE.Uniform(0),
        uTravelLength: new THREE.Uniform(options.length),
      }),
    });

    /* const lignhtMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
    }); */

    const lignhtMesh = new THREE.Mesh(instanced, lignhtMaterial);
    lignhtMesh.frustumCulled = false;
    scene.add(lignhtMesh);

    renderer.value.render(scene, camera);

    const controls = new OrbitControls(camera, view1Elem);

    const camera2 = new THREE.PerspectiveCamera(
      90, // fov
      2, // aspect
      0.1, // near
      500, // far
    );
    camera2.position.set(40, 10, 30);
    camera2.lookAt(0, 5, 0);
    const controls2 = new OrbitControls(camera2, view2Elem);
    controls2.target.set(0, 5, 0);
    controls2.update();

    const update = (delta) => {
      let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
      speedUp.value += lerp(speedUp.value, speedUpTarget.value, lerpPercentage, 0.00001);
      timeOffset.value += speedUp.value * delta;

      let time = clock.elapsedTime + timeOffset.value;

      lignhtMesh.material.uniforms.uTime.value = time;
      uTime.value.value = time;
    };

    function render() {
      // 启用剪刀函数
      renderer.value.setScissorTest(true);
      // 渲染主视野
      const delta = clock.getDelta();
      {
        const aspect = setScissorForElement(view1Elem);
        // 用计算出的aspect修改摄像机参数
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        cameraHelper.update();
        // 来原视野中不要绘制cameraHelper
        cameraHelper.visible = false;
        scene.background = new THREE.Color(0x000000);
        // 渲染
        renderer.value.render(scene, camera);
        const composer = new EffectComposer(renderer.value);
        composer.render(delta);
        update(delta);
      }
      // 渲染第二台摄像机
      {
        const aspect = setScissorForElement(view2Elem);
        // 调整aspect
        camera2.aspect = aspect;
        camera2.updateProjectionMatrix();
        // 在第二台摄像机中绘制cameraHelper
        cameraHelper.visible = true;
        scene.background.set(0x000040);
        renderer.value.render(scene, camera2);
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
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
    width: 1600px;
    height: 600px;
  }
</style>
