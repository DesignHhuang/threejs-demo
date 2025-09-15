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
  import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
  import { FontLoader } from 'three/addons/loaders/FontLoader.js';
  import { random } from 'lodash-es';

  const refInverter = ref();

  let controls: OrbitControls;
  let scene: THREE.Scene;
  // Scene
  scene = new THREE.Scene();
  let labelRenderer;

  let camera: THREE.PerspectiveCamera;
  camera = new THREE.PerspectiveCamera(
    50, // 视野角度（FOV）
    1200 / 800, // 宽高比
    0.1, // 近裁剪面
    1000, // 远裁剪面
  );
  camera.position.set(0, 2, 8); // 相机位置（x,y,z），确保能看到整个场景

  let renderer: THREE.WebGLRenderer;

  const current = ref(3);
  const voltage = ref(10);
  const power = ref(30);

  let textMesh: THREE.Mesh | null = null; // 保存文本网格引用，用于后续更新
  let font; // 保存加载的字体

  const init = () => {
    scene.background = new THREE.Color(0xf0f5ff); // 浅蓝色背景（模拟天空）
    // 初始化场景
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1200, 800);
    // 配置渲染器以适配EXR高动态范围
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    refInverter.value.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(1200, 800);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    refInverter.value.appendChild(labelRenderer.domElement);

    // 控制器
    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true;

    controls.minDistance = 1;
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
    directionalLight.position.set(-8, 8, 50);
    directionalLight.castShadow = true; // 平行光产生阴影
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
    scene.add(dirLightHelper);

    const loader = new FontLoader();
    loader.load('src/assets/images/helvetiker_regular.typeface.json', (loadedFont) => {
      font = loadedFont;
      // 初始创建文本
      updateText();
      // 启动每秒更新
      startTextUpdates();
    });

    // 加载模型
    new GLTFLoader().load('src/assets/images/house_pbr_V011.glb', (gltf) => {
      const model = gltf.scene;
      model.position.set(2, -1.5, 0);
      model.scale.set(0.5, 0.5, 0.5);
      scene.add(model);
      const earthDiv = document.createElement('div');
      earthDiv.className = 'label';
      earthDiv.textContent = 'Earth';
      earthDiv.style.backgroundColor = 'transparent';
      const earthLabel = new CSS2DObject(earthDiv);
      earthLabel.position.set(1.5 * 30, 0, 0);
      earthLabel.center.set(10, 10);
      model.add(earthLabel);
      earthLabel.layers.set(0);
      const earthMassDiv = document.createElement('div');
      earthMassDiv.className = 'label';
      earthMassDiv.textContent = '5.97237e24 kg';
      earthMassDiv.style.backgroundColor = 'transparent';
      const earthMassLabel = new CSS2DObject(earthMassDiv);
      earthMassLabel.position.set(10, 10, 10);
      earthMassLabel.center.set(10, 10);
      model.add(earthMassLabel);
      earthMassLabel.layers.set(1);
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

  // 更新文本内容的函数
  const updateText = () => {
    if (!font) return; // 确保字体已加载

    // 移除旧的文本网格
    if (textMesh && scene) {
      scene.remove(textMesh);
    }

    // 生成新的消息内容（使用当前变量值）
    const message = `Solar:\nPower: ${power.value}kW\nCurrent: ${current.value}A\nVoltage: ${voltage.value}V`;

    // 创建新的文本网格
    const color = 0x006699;
    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const shapes = font.generateShapes(message, 0.15);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    geometry.translate(-2, 2, 0.5); // 位置调整

    textMesh = new THREE.Mesh(geometry, matLite);
    scene.add(textMesh);
  };

  // 启动每秒更新变量并刷新文本
  const startTextUpdates = () => {
    setInterval(() => {
      // 随机更新变量值（模拟实时数据变化）
      current.value = random(1, 10);
      voltage.value = random(10, 100);
      power.value = current.value * voltage.value;

      // 更新文本显示
      updateText();
    }, 1000); // 每秒更新一次
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

  .label {
    color: #fff;
    font-family: sans-serif;
    padding: 2px;
    background: rgba(0, 0, 0, 0.6);
  }
</style>
