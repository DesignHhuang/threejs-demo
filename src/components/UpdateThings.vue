<template></template>

<script setup lang="ts">
import * as THREE from "three";
import { onMounted } from "vue";

let line: any;
const MAX_POINTS = 60;
let drawCount: any;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

function init() {
  // geometry
  const geometry = new THREE.BufferGeometry();

  // attributes
  const positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // drawcalls
  drawCount = 2; // draw the first 2 points, only
  geometry.setDrawRange(0, drawCount);

  // material
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // line
  line = new THREE.Line(geometry, material);
  scene.add(line);

  // update positions
  updatePositions();
}

// update positions
function updatePositions() {
  const positions = line.geometry.attributes.position.array;

  let x, y, z, index;
  x = y = z = index = 0;

  for (let i = 0, l = MAX_POINTS; i < l; i++) {
    positions[index++] = x;
    positions[index++] = y;
    positions[index++] = z;

    x += (Math.random() - 0.5) * 30;
    y += (Math.random() - 0.5) * 30;
    z += (Math.random() - 0.5) * 30;
  }
}

// render
function render() {
  renderer.render(scene, camera);
}

// animate
function animate() {
  requestAnimationFrame(animate);

  drawCount = (drawCount + 1) % MAX_POINTS;

  line.geometry.setDrawRange(0, drawCount);

  if (drawCount === 0) {
    updatePositions();
    line.geometry.attributes.position.needsUpdate = true; // required after the first render
    line.material.color.setHSL(Math.random(), 1, 0.5);
  }

  render();
}

onMounted(() => {
  init();
  animate();
});
</script>

<style scoped></style>
