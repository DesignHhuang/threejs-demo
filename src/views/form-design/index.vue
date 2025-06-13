<template>
  <PageWrapper dense contentFullHeight fixedHeight>
    <canvas id="lineContainer"></canvas>
    <div class="split">
      <div id="view1" tabindex="1"></div>
      <div id="view2" tabindex="2"></div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  onMounted(() => {
    const canvas: any = document.querySelector('#lineContainer');

    const view1Elem: any = document.querySelector('#view1');
    const view2Elem: any = document.querySelector('#view2');

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const camera = new THREE.PerspectiveCamera(75, 10 / 6, 0.1, 5);

    const cameraHelper = new THREE.CameraHelper(camera);

    camera.position.z = 2;

    const controls = new OrbitControls(camera, view1Elem);

    camera.updateProjectionMatrix();

    const camera2 = new THREE.PerspectiveCamera(
      60, // fov
      2, // aspect
      0.1, // near
      500, // far
    );
    camera2.position.set(40, 10, 30);
    camera2.lookAt(0, 5, 0);

    const controls2 = new OrbitControls(camera2, view2Elem);
    controls2.target.set(0, 5, 0);
    controls2.update();

    const scene = new THREE.Scene();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });

    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    scene.add(cameraHelper);
    renderer.render(scene, camera);

    function setScissorForElement(elem) {
      const canvas: any = document.querySelector('#lineContainer');

      const canvasRect = canvas.getBoundingClientRect();
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
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);

      // 返回aspect
      return width / height;
    }
  });
</script>

<style lang="less" scoped>
  #lineContainer {
    width: 1000px;
    height: 600px;
    border: 1px solid red;
  }
  .split {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
  }
  .split > div {
    width: 100%;
    height: 100%;
  }
</style>
