<template>
  <div ref="container"> </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import * as THREE from 'three';
  // 调整OrbitControls导入路径，适配不同Three.js版本
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { GLTFLoader } from 'three/examples/jsm/Addons.js';

  const containerWidth = 1200;
  const containerHeight = 800;

  // 容器引用
  const container = ref<HTMLDivElement>();

  // Three.js核心对象
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;

  // 初始化场景
  const initScene = () => {
    if (!container.value) return;
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // 创建相机 - 调整位置确保能看到粒子
    camera = new THREE.PerspectiveCamera(
      60, // 视野角度调小，更容易看到全部内容
      containerWidth / containerHeight,
      0.1,
      1000,
    );
    camera.position.set(8, 8, 12); // 调整相机位置，拉远一点
    camera.lookAt(0, 4, 0); // 让相机看向管道拐角处

    // 创建渲染器 - 确保alpha和抗锯齿设置正确
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(window.devicePixelRatio); // 添加像素比设置
    renderer.setSize(containerWidth, containerHeight);
    container.value.appendChild(renderer.domElement);

    // 创建控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 添加灯光 - 增强光照确保粒子可见
    addLights();

    // 加载房屋模型
    addHouseModel();

    // 加载管道
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 32, 10, true);
    const material = new THREE.MeshStandardMaterial({
      color: 0xf9f9f9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
      emissive: 0xf9f9f9,
      emissiveIntensity: 10,
    });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(3, 5, 5);
    scene.add(cylinder);

    const greengeometry = new THREE.CylinderGeometry(0.06, 0.06, 2, 32, 10);
    const greenmaterial = new THREE.MeshStandardMaterial({
      color: 0x01d05b,
      emissive: 0x01d05b,
      emissiveIntensity: 2,
    });
    const greenCylinder = new THREE.Mesh(greengeometry, greenmaterial);
    greenCylinder.position.set(3, 5, 5);
    scene.add(greenCylinder);
  };

  // 添加灯光
  const addLights = () => {
    // 增强环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(2, 10, 50);
    scene.add(directionalLight);
    const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    scene.add(helper);

    // 添加点光源增强粒子亮度
    const pointLight = new THREE.PointLight(0xffe770, 100, 10);
    pointLight.position.set(-7, 8, 0);
    scene.add(pointLight);

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    scene.add(pointLightHelper);
  };

  const addHouseModel = () => {
    new GLTFLoader().load('src/assets/images/house_pbr_V011.glb', (gltf) => {
      const model = gltf.scene;
      //model.position.set(2, -1.5, 0);
      //model.scale.set(0.5, 0.5, 0.5);
      scene.add(model);
    });
  };

  // 窗口大小调整
  const onWindowResize = () => {
    if (!container.value) return;
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerWidth, containerHeight);
  };

  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize);

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  // 组件挂载时初始化
  onMounted(() => {
    initScene();
    animate();
  });
</script>
