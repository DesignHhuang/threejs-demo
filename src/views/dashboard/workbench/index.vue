<template>
  <PageWrapper>
    <div id="flow"></div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';

  let camera: THREE.PerspectiveCamera;
  camera = new THREE.PerspectiveCamera(45, 1200 / 800, 0.1, 1000);
  //camera.position.set(0, 0, 0);
  //camera.position.set(-70, 20, 70);

  let scene: THREE.Scene;
  scene = new THREE.Scene();

  let renderer: THREE.WebGLRenderer;

  const initWall = () => {
    const geometry = new THREE.PlaneGeometry(400, 20, 20, 200);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    console.log(mesh);

    scene.add(mesh);
  };

  // 初始化容器
  const containerInit = () => {
    const container = document.getElementById('flow');

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(1200, 800, false);

    if (container) {
      // 初始化墙面
      initWall();

      console.log(camera);
      console.log(scene);
      console.log(camera);
      renderer.render(scene, camera);
      container.appendChild(renderer.domElement);
    }
  };

  function tick(): void {
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }

  onMounted(() => {
    containerInit();
    requestAnimationFrame(tick);
  });
</script>

<style lang="less" scoped>
  #flow {
    width: 1200px;
    height: 800px;
    border: 1px solid red;
  }
  canvas {
    width: 100%;
    height: 100%;
  }
</style>
