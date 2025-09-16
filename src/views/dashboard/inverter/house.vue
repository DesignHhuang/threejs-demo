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

  // 添加一个全局变量存储连接线
  let connectionLine: THREE.Line | null = null;
  // 存储房屋模型引用
  let houseModel: THREE.Object3D | null = null;

  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();
  let isDragging = false;
  let dragOffset = new THREE.Vector3();

  const canvasWidth = 1200;
  const canvasHeight = 800;

  let textBoundingBox: THREE.Box3 | null = null;
  let isHoveringBox = false;
  let originalTextColor = 0x006699; // 原始颜色

  let camera: THREE.PerspectiveCamera;
  camera = new THREE.PerspectiveCamera(
    50, // 视野角度（FOV）
    canvasWidth / canvasHeight, // 宽高比
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
    renderer.setSize(canvasWidth, canvasHeight);
    // 配置渲染器以适配EXR高动态范围
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    refInverter.value.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(canvasWidth, canvasHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    refInverter.value.appendChild(labelRenderer.domElement);

    // 控制器
    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true;

    controls.minDistance = 1;
    //controls.maxDistance = 20;

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
    directionalLight.position.set(-8, 60, 100);
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
      houseModel = model;
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

      // 模型加载完成后尝试创建连接线
      if (textMesh) {
        updateConnectionLine();
      }
    });

    // 添加鼠标事件监听
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseleave', onMouseUp);
  };

  // 处理鼠标按下事件
  const onMouseDown = (event: MouseEvent) => {
    // 只对存在的文本和边界框生效
    if (!textMesh || !textBoundingBox) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersectsBox = raycaster.ray.intersectBox(textBoundingBox, new THREE.Vector3());
    if (intersectsBox) {
      isDragging = true;
      if (textMesh.material instanceof THREE.MeshBasicMaterial) {
        textMesh.material.color.set(0xff0000);
      }
      // 基于当前文本计算偏移量
      const intersectPoint = intersectsBox;
      textMesh.getWorldPosition(dragOffset);
      dragOffset.sub(intersectPoint);
    }
  };

  // 新增：重置文本相关状态（关键）
  const resetTextState = () => {
    textBoundingBox = null;
    isHoveringBox = false;
    // 如果正在拖动，强制结束（避免新旧对象状态冲突）
    if (isDragging) {
      isDragging = false;
    }
  };

  // 处理鼠标移动事件
  const onMouseMove = (event: MouseEvent) => {
    // 若文本或边界框不存在，直接退出（避免操作已失效的对象）
    if (!textMesh || !textBoundingBox) {
      // 若之前处于悬停状态，强制重置颜色
      if (isHoveringBox) {
        isHoveringBox = false;
      }
      return;
    }
    // 拖动逻辑：确保基于当前文本计算
    if (isDragging) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane();
      plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(plane.normal),
        textMesh.position,
      );
      const dragPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, dragPoint);

      textMesh.position.copy(dragPoint.add(dragOffset));
      updateConnectionLine();

      // 实时更新新文本的边界框（拖动时位置变化）
      textBoundingBox.setFromObject(textMesh);
      return;
    }
    // 边界框检测：确保使用最新的边界框
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // 检测射线与当前文本边界框的交集
    const intersectsBox = raycaster.ray.intersectBox(textBoundingBox, new THREE.Vector3());
    const shouldHover = !!intersectsBox;

    // 状态变化时更新颜色（基于当前文本）
    if (shouldHover && !isHoveringBox) {
      isHoveringBox = true;
      if (textMesh.material instanceof THREE.MeshBasicMaterial) {
        textMesh.material.color.set(0xff0000);
      }
    } else if (!shouldHover && isHoveringBox) {
      isHoveringBox = false;
      if (textMesh.material instanceof THREE.MeshBasicMaterial) {
        textMesh.material.color.set(originalTextColor);
      }
    }
  };

  // 处理鼠标释放事件
  const onMouseUp = () => {
    isDragging = false;
    if (textMesh && textMesh.material instanceof THREE.MeshBasicMaterial) {
      // 颜色基于当前是否悬停在新文本上
      textMesh.material.color.set(isHoveringBox ? 0xff0000 : originalTextColor);
    }
  };

  // 更新文本内容的函数
  const updateText = () => {
    if (!font) return; // 确保字体已加载

    // 移除旧文本前，先重置状态
    resetTextState();

    // 移除旧的文本网格
    if (textMesh && scene) {
      scene.remove(textMesh);
    }

    // 生成新的消息内容（使用当前变量值）
    const message = `Solar:\nPower: ${power.value}kW\nCurrent: ${current.value}A\nVoltage: ${voltage.value}V`;

    // 创建新的文本网格
    const matLite = new THREE.MeshBasicMaterial({
      color: originalTextColor,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const shapes = font.generateShapes(message, 0.15);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    geometry.translate(-2, 2, 0.5); // 位置调整
    geometry.computeBoundingBox(); // 平移后重新计算边界框（关键！）

    textMesh = new THREE.Mesh(geometry, matLite);
    scene.add(textMesh);

    // 计算并保存世界坐标系中的边界框（关键）
    textBoundingBox = new THREE.Box3().setFromObject(textMesh);

    // 文本更新后更新连接线
    //updateConnectionLine();
  };

  // 创建或更新连接线的函数
  const updateConnectionLine = () => {
    if (!houseModel || !textMesh) return;

    // 移除旧的连接线
    if (connectionLine && scene) {
      scene.remove(connectionLine);
    }

    // 创建线条材质
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x838383, // 与文本相同的颜色
      linewidth: 2,
    });

    // 获取房屋模型的世界位置
    const houseWorldPos = new THREE.Vector3();
    houseModel.getWorldPosition(houseWorldPos);
    //console.log(houseWorldPos);

    // 稍微调整连接点，使其从房屋顶部连接
    const houseConnectionPoint = new THREE.Vector3(
      houseWorldPos.x - 3.5,
      houseWorldPos.y + 1.5, // 向上偏移一些，连接到房屋顶部
      houseWorldPos.z + 0.5,
    );

    // 1. 获取几何体经过 translate 后的边界框中心（本地坐标系）
    const textGeometry = textMesh.geometry;
    // 确保边界框已计算（如果文本更新过，需要重新计算）
    textGeometry.computeBoundingBox();
    const bbox: any = textGeometry.boundingBox;
    // 底部中间点 = X轴中点，Y轴最小值（底部），Z轴中点
    const bottomMiddle = new THREE.Vector3(
      (bbox.min.x + bbox.max.x) / 2, // X轴中间
      bbox.min.y, // Y轴最小值（底部）
      (bbox.min.z + bbox.max.z) / 2, // Z轴中间（如果文本是2D的，Z轴可能为0）
    );

    // 2. 将本地中心转换为世界坐标（叠加 textMesh 的世界位置）
    const textWorldPos = new THREE.Vector3();
    textMesh.localToWorld(textWorldPos.copy(bottomMiddle)); // 关键：本地坐标转世界坐标

    // 创建线条的点
    const points = [houseConnectionPoint, textWorldPos];
    // 创建线条几何体
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    // 创建线条并添加到场景
    connectionLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(connectionLine);
  };

  // 启动每秒更新变量并刷新文本
  const startTextUpdates = () => {
    setTimeout(() => {
      // 随机更新变量值（模拟实时数据变化）
      current.value = random(1, 10);
      voltage.value = random(10, 100);
      power.value = current.value * voltage.value;

      // 更新文本显示
      updateText();
      // 更新连接线（文本位置变化后）
      //updateConnectionLine();
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
