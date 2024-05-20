<template>
  <PageWrapper title="小栗子">
    <div class="container" ref="refContainer"></div>
    <div id="boink">Boink!!</div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';
  import { getBoundingClientRect } from '@/utils/domUtils';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

  import { getProject, onChange, types, val } from '@theatre/core';
  /*  import swooshSound from '../assets/sounds/whoosh.mp3';
  import boinkSound from '../assets/sounds/boink.mp3';
  import thudSound from '../assets/sounds/loud-thud-45719.mp3'; */

  import studio from '@theatre/studio';

  const refContainer = ref();

  let project;
  studio.initialize();
  // Create a project from local state
  project = getProject('TheatreTutorial_1');

  // Create a sheet
  const sheet = project.sheet('AnimationScene');

  let controls: OrbitControls;
  let camera: THREE.PerspectiveCamera;
  // Camera
  camera = new THREE.PerspectiveCamera(70, 900 / 600, 10, 300);
  camera.position.set(0, 0, 70);
  //camera.position.set(-70, 20, 70);

  let scene: THREE.Scene;
  // Scene
  scene = new THREE.Scene();

  let textRenderer: CSS2DRenderer;
  // TextRenderer
  textRenderer = new CSS2DRenderer();
  textRenderer.setSize(window.innerWidth, window.innerHeight);
  textRenderer.domElement.style.position = 'absolute';
  textRenderer.domElement.style.top = '0';
  textRenderer.domElement.style.left = '0';
  textRenderer.domElement.style.width = '100%';
  textRenderer.domElement.style.height = '100%';
  textRenderer.domElement.style.zIndex = '2';

  let renderer: THREE.WebGLRenderer;

  // Box
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  //const boxMaterial = new THREE.MeshBasicMaterial();
  const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x049ef4, emissive: 0xff0000 });

  const box = new THREE.Mesh(geometry, boxMaterial);
  //box.castShadow = true; // 对象是否被渲染到阴影贴图中
  //box.receiveShadow = true; //材质是否接收阴影
  scene.add(box);

  // Floor
  const floorGeometry = new THREE.CylinderGeometry(20, 20, 30, 30);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x049ef4, emissive: 0x049ef4 });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.set(0, -20, 0);
  //floor.position.set(0, -150, 0);
  //floor.receiveShadow = true; //材质是否接收阴影
  scene.add(floor);

  const boxObj = sheet.object('Box', {
    rotation: types.compound({
      xR: types.number(box.rotation.x, { range: [-Math.PI, Math.PI] }),
      yR: types.number(box.rotation.y, { range: [-Math.PI, Math.PI] }),
      zR: types.number(box.rotation.z, { range: [-Math.PI, Math.PI] }),
    }),
    position: types.compound({
      x: types.number(0, { nudgeMultiplier: 0.1 }),
      y: types.number(0, { nudgeMultiplier: 0.1 }),
      z: types.number(0, { nudgeMultiplier: 0.1 }),
    }),
    scale: types.compound({
      xS: types.number(1, { nudgeMultiplier: 0.1 }),
      yS: types.number(1, { nudgeMultiplier: 0.1 }),
      zS: types.number(1, { nudgeMultiplier: 0.1 }),
    }),
  });

  /* const colorObj = sheet.object('Colors', {
    backgroundColor: types.rgba(),
    floorColor: types.rgba(),
    boxColor: types.rgba(),
  }); */

  const boxEffectsObj = sheet.object('Effects', {
    boxGlow: types.rgba(),
    swooshScale: types.number(1, { nudgeMultiplier: 0.01 }),
    swooshPosition: types.number(0, { nudgeMultiplier: 0.01 }),
    swooshOpacity: types.number(1, { nudgeMultiplier: 0.01 }),
  });

  const textEffectObj = sheet.object('text', {
    opacity: 1,
    text: '',
    scale: 1,
  });

  const setupOrbitControls = () => {
    // OrbitControls
    controls = new OrbitControls(camera, textRenderer.domElement);
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.rotateSpeed = 1;
    controls.dampingFactor = 0.08;
    controls.minDistance = 30;
    controls.maxDistance = 120;
    controls.target.set(0, 20, 0);
    controls.maxPolarAngle = 4 * (Math.PI / 7);
    controls.minPolarAngle = 1 * (Math.PI / 7);
  };

  const init = () => {
    refContainer.value.appendChild(textRenderer.domElement);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(900, 600);
    //renderer.render(scene, camera);

    // Swoosh Effect Objects
    const swooshMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 1,
    });

    const swooshEffect = new THREE.Group();

    const swooshBig = new THREE.Mesh(geometry, swooshMaterial);
    swooshBig.scale.set(0.02, 2, 0.02);
    swooshBig.position.set(1, 0, -2);

    const swooshSmall1 = new THREE.Mesh(geometry, swooshMaterial);
    swooshSmall1.scale.set(0.02, 1, 0.02);
    swooshSmall1.position.set(1, 0, 3);

    const swooshSmall2 = new THREE.Mesh(geometry, swooshMaterial);
    swooshSmall2.scale.set(0.02, 1.4, 0.02);
    swooshSmall2.position.set(-3, 0, 0);

    swooshEffect.add(swooshBig, swooshSmall1, swooshSmall2);
    swooshEffect.position.set(0, 20, 0);
    scene.add(swooshEffect);

    // Text Effects
    const boinkDom = document.getElementById('boink');
    // @ts-ignore
    const boinkText = new CSS2DObject(boinkDom);
    boinkText.position.set(-25, 0, 0);
    box.add(boinkText);

    setupOrbitControls();

    boxObj.onValuesChange((values) => {
      console.log(values);
      const { xR, yR, zR } = values.rotation;
      box.rotation.set(xR, yR, zR);
      const { x, y, z } = values.position;
      box.position.set(x, y, z);
      const { xS, yS, zS } = values.scale;
      box.scale.set(xS, yS, zS);
    });

    textEffectObj.onValuesChange((values) => {
      if (!boinkDom) return;
      boinkDom.innerText = values.text;
      boinkDom.style.opacity = '' + values.opacity;
      boinkDom.style.fontSize = '' + values.scale + 'px';
    });

    /* colorObj.onValuesChange((values) => {
      scene.fog.color = new THREE.Color(values.backgroundColor.toString());
      document.body.style.backgroundColor = values.backgroundColor;
      floorMaterial.color.setRGB(values.floorColor.r, values.floorColor.g, values.floorColor.b);
      boxMaterial.color.setRGB(values.boxColor.r, values.boxColor.g, values.boxColor.b);
    }); */

    boxEffectsObj.onValuesChange((values) => {
      boxMaterial.emissive.setRGB(values.boxGlow.r, values.boxGlow.g, values.boxGlow.b);
      swooshEffect.scale.setY(values.swooshScale);
      swooshEffect.position.setY(values.swooshPosition);
      swooshMaterial.opacity = values.swooshScale;
    });

    renderer.render(scene, camera);
    textRenderer.render(scene, camera);
    //controls.update();
    refContainer.value.appendChild(renderer.domElement);
  };

  // RAF Update the screen
  function tick(): void {
    renderer.render(scene, camera);
    textRenderer.render(scene, camera);
    controls.update();
    window.requestAnimationFrame(tick);
  }

  onMounted(() => {
    const box = getBoundingClientRect(refContainer.value);
    console.log(box);
    init();
    requestAnimationFrame(tick);
  });
</script>
<style lang="less" scoped>
  .container {
    width: 900px;
    height: 600px;
    border: 1px solid red;
  }
</style>
