<template>
  <div id="container"></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { onMounted } from "vue";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import Stats from "three/addons/libs/stats.module.js";

let camera: any, scene: any, renderer: any;
let mixer: any, controls: any;
const clock = new THREE.Clock();
const stats = new Stats();

function init() {
  const container = document.getElementById("container");
  console.log(container);

  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.25,
    20
  );
  camera.position.set(0, 0, 24);

  scene = new THREE.Scene();

  new RGBELoader().setPath("hdr/").load("jianlue.hdr", function (texture: any) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.rotation = 90;
    console.log(texture);

    scene.background = texture;
    scene.environment = texture;

    render();

    // model

    const loader = new GLTFLoader().setPath("models/");
    loader.load("3.glb", async function (gltf: any) {
      const model = gltf.scene;

      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();

      renderer.setAnimationLoop(animate);

      // wait until the model can be added to the scene without blocking due to shader compilation

      /* await renderer.compileAsync(model, camera, scene);

      

      render(); */
    });
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  container && container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  controls.minDistance = 1;
  controls.maxDistance = 10;
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function animate() {
  const delta = clock.getDelta();

  mixer.update(delta);

  controls.update();

  stats.update();

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

//

function render() {
  renderer.render(scene, camera);
}

onMounted(() => {
  init();
});
</script>

<style scoped></style>
