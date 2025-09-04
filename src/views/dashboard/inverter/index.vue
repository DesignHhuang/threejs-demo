<template>
  <PageWrapper>
    <div ref="refInverter" class="flow"></div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';
  import { getBoundingClientRect } from '@/utils/domUtils';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { Flow } from 'three/addons/modifiers/CurveModifier.js';
  import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
  import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import solarpanelTexture from '@/assets/images/sloarpanel.png';

  const refInverter = ref();

  const init = () => {
    // 1. 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f5ff); // 浅蓝色背景（模拟天空）

    // 2. 创建相机（透视相机，适合模拟人眼视角）
    const camera = new THREE.PerspectiveCamera(
      75, // 视野角度（FOV）
      1200 / 800, // 宽高比
      0.1, // 近裁剪面
      1000, // 远裁剪面
    );
    camera.position.set(10, 8, 15); // 相机位置（x,y,z），确保能看到整个场景

    // 3. 创建渲染器（抗锯齿+适配窗口）
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1200, 800);
    renderer.shadowMap.enabled = true; // 开启阴影（增强真实感）

    // 5. 添加光照（模拟太阳+环境光）
    // 平行光（模拟太阳光，带阴影）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true; // 平行光产生阴影
    scene.add(directionalLight);
    // 环境光（照亮暗部，避免过暗）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 6. 地面（模拟地面场景）
    const groundGeometry = new THREE.PlaneGeometry(30, 30); // 30x30 平面
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0, // 浅灰色
      roughness: 0.8, // 粗糙感（避免反光过强）
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // 旋转90度（平面默认垂直，需放平）
    ground.position.y = 0; // 地面高度为0
    ground.receiveShadow = true; // 地面接收阴影
    scene.add(ground);

    // 光伏板参数
    const panelWidth = 2;
    const panelHeight = 1.2;
    const panelCount = 4; // 光伏板数量
    const panelGap = 0.5; // 板间距

    // 加载光伏板纹理（可替换为自己的图片）
    const panelTextureLoader = new THREE.TextureLoader();
    const panelTexture = panelTextureLoader.load('src/assets/images/sloarpanel.png');
    console.log(panelTexture);

    // 创建光伏板阵列（循环生成4块光伏板）
    for (let i = 0; i < panelCount; i++) {
      const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
      const panelMaterial = new THREE.MeshStandardMaterial({
        map: panelTexture, // 纹理映射
        metalness: 0.3, // 金属感
        roughness: 0.5, // 粗糙感
      });
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);

      // 位置：x轴排列，y轴抬高（离地1.5m），z轴固定
      panel.position.set(
        -panelWidth - panelGap + i * (panelWidth + panelGap), // x轴分散排列
        1.5,
        5,
      );
      // 倾斜角度：沿x轴旋转15度（模拟朝向太阳）
      panel.rotation.x = -Math.PI / 12;
      panel.castShadow = true; // 光伏板产生阴影
      panel.receiveShadow = true; // 接收其他物体阴影

      scene.add(panel);
      // 存储光伏板引用（后续用于交互）
      scene.userData.panels = scene.userData.panels || [];
      scene.userData.panels.push(panel);
    }

    // 电池参数
    const batteryWidth = 0.8;
    const batteryHeight = 1.5;
    const batteryDepth = 0.5;
    const batteryCount = 3; // 3节电池串联

    // 创建电池组
    for (let i = 0; i < batteryCount; i++) {
      const batteryGeometry = new THREE.BoxGeometry(batteryWidth, batteryHeight, batteryDepth);
      // 初始材质（待机状态：蓝色）
      const batteryMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a90e2,
        roughness: 0.6,
      });
      const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);

      // 位置：x轴排列，y轴居中，z轴在光伏板对面
      battery.position.set(
        -batteryWidth - 0.3 + i * (batteryWidth + 0.3),
        batteryHeight / 2, // 底部贴地（y=0）
        -3,
      );
      battery.castShadow = true;
      battery.receiveShadow = true;

      // 存储电池状态和材质引用（后续切换状态）
      battery.userData.isCharging = false;
      battery.userData.material = batteryMaterial;

      scene.add(battery);
      scene.userData.batteries = scene.userData.batteries || [];
      scene.userData.batteries.push(battery);
    }

    // 加载逆变器模型（替换为你的模型路径）
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      './battery.gltf',
      (gltf) => {
        console.log(gltf);
        const inverter = gltf.scene;

        // 调整模型位置和大小（根据实际模型调整）
        inverter.position.set(0, 0, 1);
        inverter.scale.set(0.8, 0.8, 0.8);

        // 开启阴影
        /* inverter.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }); */

        scene.add(inverter);
        scene.userData.inverter = inverter; // 存储引用
      },
      (xhr) => {
        // 加载进度
        console.log(`模型加载进度：${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        // 加载错误
        console.error('模型加载失败：', error);
      },
    );

    // 4. 轨道控制器（支持鼠标交互）
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼效果（滑动更顺滑）
    controls.target.set(0, 2, 0); // 控制焦点（对准场景中心）

    renderer.render(scene, camera);
    refInverter.value.appendChild(renderer.domElement);
  };

  onMounted(() => {
    init();
  });
</script>

<style lang="less" scoped>
  .flow {
    width: 1200px;
    height: 800px;
    border: 1px solid red;
  }
</style>
