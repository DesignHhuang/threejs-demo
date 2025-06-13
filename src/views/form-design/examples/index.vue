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

  const fragmentShader = `
    uniform vec3 uColor;
    void main(){
      gl_FragColor = vec4(uColor,1.);
    }
  `;

  const vertexShader = `
    void main(){
      vec3 transformed = position.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.);
    }
  `;

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
    nPairs: 50,
    //distortion: myCustomDistortion,

    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0x131318,
      brokenLines: 0x131318,
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
    const camera = new THREE.PerspectiveCamera(45, 1000 / 600, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(1000, 600, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    energyContainerRef.value.append(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(options.width, options.length, 20, 200);
    //const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        //uColor: new THREE.Uniform(new THREE.Color(0x101012)),
        uColor: new THREE.Uniform(new THREE.Color(0xccc9e7)),
      },
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 4; // 弧度，转为角度相当于90度
    mesh.position.z = -options.length / 2;

    scene.add(mesh);

    camera.position.z = 20;
    camera.position.y = 7;
    camera.position.x = 0;

    const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));
    const baseGeometry: any = new THREE.TubeGeometry(curve, 25, 1, 8, false);
    const instanced = new THREE.InstancedBufferGeometry().copy(baseGeometry);
    instanced.instanceCount = options.nPairs * 2;

    // 偏移量
    let aOffset: any[] = [];
    let aColor: any[] = [];

    // 车道的宽度  路宽除以车道数
    let laneWidth = options.roadWidth / options.lanesPerRoad;
    // 共50对
    for (let i = 0; i < options.nPairs; i++) {
      let radius = 1; //半径
      // 1a. Get it's lane index
      // Instead of random, keep lights per lane consistent
      let lane = i % 3;

      // 1b. Get its lane's centered position
      let laneX = lane * laneWidth - options.roadWidth / 2 + laneWidth / 2;

      // 车宽度等于车道宽度的一半
      let carWidth = 0.5 * laneWidth;
      let offsetX = 0.5 * Math.random();

      let offsetY = radius * 1.3;

      let offsetZ = -random(options.length);

      aOffset.push(laneX - carWidth / 2 + offsetX);
      aOffset.push(offsetY);
      aOffset.push(offsetZ);

      aOffset.push(laneX + carWidth / 2 + offsetX);
      aOffset.push(offsetY);
      aOffset.push(offsetZ);

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
      'aColor',
      new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false),
    );

    const lignhtMaterial = new THREE.ShaderMaterial({
      fragmentShader: carLightsFragment,
      vertexShader: carLightsVertex,
    });

    const lignhtMesh = new THREE.Mesh(instanced, lignhtMaterial);
    scene.add(lignhtMesh);

    renderer.render(scene, camera);

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(0, 0, 0);
    controls.update();

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
