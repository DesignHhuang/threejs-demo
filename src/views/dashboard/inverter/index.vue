<template>
  <PageWrapper>
    <div ref="refInverter" class="flow"></div>

    <div
      style="
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: Arial;
      "
    >
      <div>光伏板实时发电量：<span id="power">0</span> kW</div>
      <div>储能电池容量：<span id="batteryLevel">0</span> %</div>
      <div>系统状态：<span id="systemStatus">待机</span></div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
  import { LineCurve3 } from 'three';

  const refInverter = ref();

  let controls: OrbitControls;
  let scene: THREE.Scene;
  // Scene
  scene = new THREE.Scene();

  let camera: THREE.PerspectiveCamera;
  // 2. 创建相机（透视相机，适合模拟人眼视角）
  camera = new THREE.PerspectiveCamera(
    75, // 视野角度（FOV）
    1200 / 800, // 宽高比
    0.1, // 近裁剪面
    1000, // 远裁剪面
  );
  camera.position.set(10, 8, 15); // 相机位置（x,y,z），确保能看到整个场景

  let renderer: THREE.WebGLRenderer;

  const init = () => {
    // 1. 创建场景
    scene.background = new THREE.Color(0xf0f5ff); // 浅蓝色背景（模拟天空）

    // 3. 创建渲染器（抗锯齿+适配窗口）
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1200, 800);
    renderer.shadowMap.enabled = true; // 开启阴影（增强真实感）

    // 5. 添加光照（模拟太阳+环境光）
    // 平行光（模拟太阳光，带阴影）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(0, 6, 20);
    directionalLight.castShadow = true; // 平行光产生阴影
    scene.add(directionalLight);

    /* const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
    scene.add(dirLightHelper); */

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

      //创建一个二维的线条
      const material = new THREE.LineBasicMaterial({
        color: 0x0000ff,
      });

      const points: any[] = [];
      points.push(new THREE.Vector3(-10, 0, 0));
      points.push(new THREE.Vector3(0, 10, 0));
      points.push(new THREE.Vector3(10, 0, 0));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const line = new THREE.Line(geometry, material);
      scene.add(line);
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
      'src/assets/images/inverter_pbr.glb',
      (gltf) => {
        console.log(gltf);
        const inverter = gltf.scene;

        // 调整模型位置和大小（根据实际模型调整）
        inverter.position.set(1, 2, 8);
        inverter.scale.set(4, 4, 4);

        // 开启阴影
        /*  inverter.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }); */

        // 遍历所有材质，修复纹理颜色空间
        /* inverter.traverse((child) => {
          if (child.isMesh && child.material) {
            const mat = child.material;
            // 对基础颜色纹理设置 sRGB 编码
            if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
            // 对金属粗糙度纹理等非颜色纹理设置线性编码
            if (mat.metalnessMap || mat.roughnessMap) {
              if (mat.metalnessMap) mat.metalnessMap.encoding = THREE.LinearEncoding;
              if (mat.roughnessMap) mat.roughnessMap.encoding = THREE.LinearEncoding;
            }
            mat.needsUpdate = true; // 强制更新材质
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

    /* new RGBELoader().load('src/assets/images/royal_esplanade_1k.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      // model
    }); */

    // 4. 轨道控制器（支持鼠标交互）
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼效果（滑动更顺滑）
    controls.target.set(0, 2, 0); // 控制焦点（对准场景中心）

    renderer.render(scene, camera);
    refInverter.value.appendChild(renderer.domElement);
  };

  // 创建粒子系统（能量流）
  function createEnergyFlow() {
    // 粒子几何（点集合）
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100; // 粒子数量
    const positions = new Float32Array(particleCount * 3); // 每个粒子3个坐标（x,y,z）

    // 初始化粒子位置（光伏板到电池的路径）
    for (let i = 0; i < particleCount * 3; i += 3) {
      // x：从光伏板（-3）到电池（3）
      positions[i] = THREE.MathUtils.randFloat(-3, 3);
      // y：高度1.2m（与光伏板、逆变器中心对齐）
      positions[i + 1] = 1.2;
      // z：从光伏板（5）到逆变器（1）再到电池（-3）
      positions[i + 2] = THREE.MathUtils.randFloat(-3, 5);
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 粒子材质（带颜色的点）
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08, // 粒子大小
      color: 0xffff00, // 初始黄色（光伏板端）
      transparent: true,
      opacity: 0.8,
    });

    const energyFlow = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(energyFlow);
    scene.userData.energyFlow = energyFlow;
  }

  // 粒子动画：模拟能量流动（每帧更新粒子位置）
  function updateEnergyFlow() {
    const energyFlow = scene.userData.energyFlow;
    if (!energyFlow) return;

    const positions = energyFlow.geometry.attributes.position.array;
    const particleCount = positions.length / 3;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // z轴移动（向电池方向移动，速度0.02）
      positions[idx + 2] -= 0.02;

      // 粒子超出电池范围（z < -3）时，重置到光伏板端（z=5）
      if (positions[idx + 2] < -3) {
        positions[idx] = THREE.MathUtils.randFloat(-3, 3);
        positions[idx + 2] = 5;
      }

      // 颜色渐变：z>1（光伏板端）→ 黄色；1>z>-1（逆变器端）→ 橙色；z<-1（电池端）→ 绿色
      const z = positions[idx + 2];
      let color;
      if (z > 1) color = 0xffff00;
      else if (z > -1) color = 0xff9900;
      else color = 0x33cc33;
      energyFlow.material.color.set(color);
    }

    energyFlow.geometry.attributes.position.needsUpdate = true; // 通知Three.js更新位置
  }

  // 模拟实时数据（每2秒更新一次）
  function simulateRealData() {
    const powerElem = document.getElementById('power') as any;
    const batteryLevelElem = document.getElementById('batteryLevel') as any;
    const statusElem = document.getElementById('systemStatus') as any;

    // 随机生成发电量（1~5 kW）
    const power = THREE.MathUtils.randFloat(1, 5).toFixed(1);
    powerElem.textContent = power;

    // 电池容量：根据发电量变化（充电时增加，放电时减少）
    let batteryLevel: any = parseFloat(batteryLevelElem.textContent) || 50;
    const isCharging = batteryLevel < 90; // 容量<90%时充电，否则放电
    if (isCharging) {
      batteryLevel += THREE.MathUtils.randFloat(0.5, 1.5); // 充电：每次+0.5~1.5%
      statusElem.textContent = '充电中';
    } else {
      batteryLevel -= THREE.MathUtils.randFloat(0.3, 0.8); // 放电：每次-0.3~0.8%
      statusElem.textContent = '放电中';
    }
    batteryLevel = Math.max(10, Math.min(100, batteryLevel)).toFixed(1); // 限制在10~100%
    batteryLevelElem.textContent = batteryLevel;

    // 联动电池颜色：充电（绿色）、放电（红色）、待机（蓝色）
    const batteries = scene.userData.batteries;
    if (batteries) {
      batteries.forEach((battery) => {
        battery.userData.isCharging = isCharging;
        if (isCharging) {
          battery.userData.material.color.set(0x33cc33); // 绿色（充电）
        } else {
          battery.userData.material.color.set(0xff4444); // 红色（放电）
        }
      });
    }

    // 2秒后再次更新数据
    setTimeout(simulateRealData, 2000);
  }

  // 渲染循环（核心：每帧更新场景）
  function animate() {
    requestAnimationFrame(animate);

    // 更新轨道控制器（保持阻尼效果）
    controls.update();

    // 更新能量流动效果
    updateEnergyFlow();

    // 渲染场景
    renderer.render(scene, camera);
  }

  // 窗口大小适配
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 点击交互：点击光伏板/电池显示详情
  /* window.addEventListener('click', (event) => {
    // 1. 将鼠标坐标转换为Three.js屏幕坐标
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 2. 创建射线检测（从相机到鼠标点击点）
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 3. 检测与哪些物体相交
    const intersects = raycaster.intersectObjects([
      ...(scene.userData.panels || []),
      ...(scene.userData.batteries || []),
    ]);

    // 4. 处理相交结果（显示详情）
    if (intersects.length > 0) {
      const target = intersects[0].object;
      let info = '';
      if (scene.userData.panels.includes(target)) {
        info = '光伏板\n实时发电量：' + document.getElementById('power').textContent + ' kW';
      } else if (scene.userData.batteries.includes(target)) {
        info =
          '储能电池\n当前容量：' +
          document.getElementById('batteryLevel').textContent +
          '%\n状态：' +
          (target.userData.isCharging ? '充电中' : '放电中');
      }
      alert(info); // 实际项目中可替换为自定义弹窗
    }
  }); */

  onMounted(() => {
    init();
    createEnergyFlow();
    simulateRealData();
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
