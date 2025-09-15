<template>
  <PageWrapper>
    <div ref="refInverter" class="flow"></div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

  const refInverter = ref();

  let controls: OrbitControls;
  let scene: THREE.Scene;
  // Scene
  scene = new THREE.Scene();

  let camera: THREE.PerspectiveCamera;
  camera = new THREE.PerspectiveCamera(
    50, // 视野角度（FOV）
    1200 / 800, // 宽高比
    0.1, // 近裁剪面
    1000, // 远裁剪面
  );
  camera.position.set(0, 2, 8); // 相机位置（x,y,z），确保能看到整个场景

  let renderer: THREE.WebGLRenderer;

  const init = () => {
    scene.background = new THREE.Color(0xf0f5ff); // 浅蓝色背景（模拟天空）
    // 初始化场景
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1200, 800);
    // 配置渲染器以适配EXR高动态范围
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    refInverter.value.appendChild(renderer.domElement);

    // 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    controls.minDistance = 8;
    controls.maxDistance = 20;

    controls.maxPolarAngle = Math.PI / 2;

    // LIGHTS
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    scene.add(hemiLightHelper);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(-10, 20, 50);
    directionalLight.castShadow = true; // 平行光产生阴影
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
    scene.add(dirLightHelper);

    // 加载模型
    new GLTFLoader().load('src/assets/images/house_pbr_V011.glb', (gltf) => {
      const model = gltf.scene;

      model.position.set(2, -1.5, 0);
      model.scale.set(0.5, 0.5, 0.5);

      scene.add(model);

      // 调整PBR材质颜色
      /* model.traverse((child) => {
          console.log(child);
          if (child.isMesh && child.material.isMeshStandardMaterial) {
            const mat = child.material;
            mat.color.set(0xffcc00); // 设置基础颜色为金色
            mat.metalness = 0.8; // 金属质感
            mat.roughness = 0.2; // 光滑表面
            mat.envMapIntensity = 1.2; // 增强环境反射
            mat.needsUpdate = true;
          }
        }); */
    });
  };

  // 渲染循环
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // 窗口 resize 处理
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  onMounted(() => {
    init();
    animate();
  });
</script>

<style lang="less" scoped>
  .flow {
    width: 1200px;
    height: 800px;
    border: 1px solid red;
  }
</style>
