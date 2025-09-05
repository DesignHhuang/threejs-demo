<template>
  <PageWrapper>
    <div ref="refInverter" class="flow"></div>

    <button id="disassembleBtn">拆解设备</button>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

  const refInverter = ref();

  // 初始化场景
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // 初始化相机
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;

  // 初始化渲染器
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 设备组件 - 这里用简单几何体模拟设备零件
  const components = [];

  // 主体
  const mainBody = new THREE.Mesh(
    new THREE.BoxGeometry(4, 3, 2),
    new THREE.MeshPhongMaterial({ color: 0x3498db }),
  );
  components.push({
    mesh: mainBody,
    targetPosition: new THREE.Vector3(0, 0, 0), // 初始位置
  });
  scene.add(mainBody);

  // 左侧部件
  const leftPart = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 1.5),
    new THREE.MeshPhongMaterial({ color: 0xe74c3c }),
  );
  leftPart.position.x = -3;
  components.push({
    mesh: leftPart,
    targetPosition: new THREE.Vector3(-7, 0, 0), // 拆解后位置
  });
  scene.add(leftPart);

  // 右侧部件
  const rightPart = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 1.5),
    new THREE.MeshPhongMaterial({ color: 0x2ecc71 }),
  );
  rightPart.position.x = 3;
  components.push({
    mesh: rightPart,
    targetPosition: new THREE.Vector3(7, 0, 0), // 拆解后位置
  });
  scene.add(rightPart);

  // 顶部部件
  const topPart = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 2, 32),
    new THREE.MeshPhongMaterial({ color: 0xf39c12 }),
  );
  topPart.position.y = 2.5;
  topPart.rotation.x = Math.PI / 2;
  components.push({
    mesh: topPart,
    targetPosition: new THREE.Vector3(0, 6, 0), // 拆解后位置
  });
  scene.add(topPart);

  // 记录初始位置，用于后续可能的组装功能
  components.forEach((comp) => {
    comp.initialPosition = new THREE.Vector3().copy(comp.mesh.position);
  });

  // 拆解状态标记
  let isDisassembled = false;

  // 拆解/组装函数
  function toggleDisassembly() {
    isDisassembled = !isDisassembled;

    // 使用GSAP实现平滑动画
    components.forEach((comp) => {
      const targetPos = isDisassembled ? comp.targetPosition : comp.initialPosition;

      gsap.to(comp.mesh.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: 'power2.inOut',
      });

      // 可以添加旋转动画增强效果
      gsap.to(comp.mesh.rotation, {
        x: isDisassembled ? Math.random() * 0.5 : 0,
        y: isDisassembled ? Math.random() * 0.5 : 0,
        duration: 1.5,
        ease: 'power2.inOut',
      });
    });

    // 更新按钮文本
    document.getElementById('disassembleBtn').textContent = isDisassembled
      ? '组装设备'
      : '拆解设备';
  }

  // 绑定按钮事件
  document.getElementById('disassembleBtn').addEventListener('click', toggleDisassembly);

  // 窗口大小调整
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 动画循环
  function animate() {
    requestAnimationFrame(animate);

    // 轻微旋转视角，方便观察3D效果
    if (!isDisassembled) {
      scene.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
  }

  animate();
</script>

<style lang="less" scoped>
  .flow {
    width: 1200px;
    height: 800px;
    border: 1px solid red;
  }
</style>
