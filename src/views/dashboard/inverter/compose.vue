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
  import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

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
    //scene.background = new THREE.Color(0xf0f5ff); // 浅蓝色背景（模拟天空）
    // 初始化场景
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1200, 800);
    // 配置渲染器以适配EXR高动态范围
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    refInverter.value.appendChild(renderer.domElement);

    // 控制器
    controls = new OrbitControls(camera, renderer.domElement);

    /* const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, -20, 100);
    directionalLight.castShadow = true; // 平行光产生阴影
    scene.add(directionalLight); */

    // 环境光（照亮暗部，避免过暗）
    /* const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight); */

    new EXRLoader().load('src/assets/images/GSG_PRO_STUDIOS_METAL_002.exr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // 优化纹理参数
      texture.anisotropy = 1; // 降低各向异性，减少近距离细节
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter; // 远处更模糊
      texture.magFilter = THREE.LinearFilter;

      scene.background = texture;
      scene.environment = texture;

      // 加载模型
      new GLTFLoader().load('src/assets/images/inverter_pbr.glb', (gltf) => {
        const model = gltf.scene;

        model.position.set(0, 0, 0);

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
