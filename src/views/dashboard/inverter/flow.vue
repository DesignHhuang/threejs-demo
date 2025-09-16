<template>
  <div class="electric-flow-container" ref="container">
    <!-- 调试信息 -->
    <div class="debug-info" v-if="showDebug"> 粒子状态: {{ particleStatus }} </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
  import * as THREE from 'three';
  // 调整OrbitControls导入路径，适配不同Three.js版本
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  // 容器引用
  const container = ref<HTMLDivElement>(null);
  // 调试状态
  const showDebug = ref(false);
  const debug = reactive({
    particleStatus: '未初始化',
  });

  // Three.js核心对象
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let animationId: number;
  let particles: THREE.Points | null = null;
  let particleMaterial: THREE.ShaderMaterial | null = null;

  // 初始化场景
  const initScene = () => {
    if (!container.value) return;

    debug.particleStatus = '初始化中...';

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // 创建相机 - 调整位置确保能看到粒子
    camera = new THREE.PerspectiveCamera(
      60, // 视野角度调小，更容易看到全部内容
      container.value.clientWidth / container.value.clientHeight,
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
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    container.value.appendChild(renderer.domElement);

    // 创建控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 添加灯光 - 增强光照确保粒子可见
    addLights();

    // 创建墙体和管道
    createWallsAndPipes();

    // 创建粒子系统
    createParticles();

    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize);

    debug.particleStatus = '初始化完成';
  };

  // 添加灯光
  const addLights = () => {
    // 增强环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // 添加点光源增强粒子亮度
    const pointLight = new THREE.PointLight(0x00ffff, 0.5);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);
  };

  // 创建墙体和管道
  const createWallsAndPipes = () => {
    // 墙体材质
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x333344,
      roughness: 0.8,
      metalness: 0.2,
    });

    // 墙面1 (水平)
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 6), wallMaterial);
    wall1.position.set(0, 3, 0);
    wall1.rotation.x = Math.PI / 2;
    scene.add(wall1);

    // 墙面2 (垂直)
    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 6), wallMaterial);
    wall2.position.set(0, 3, 0);
    wall2.rotation.y = Math.PI / 2;
    scene.add(wall2);

    // 管道材质
    const pipeMaterial = new THREE.MeshStandardMaterial({
      color: 0x666688,
      roughness: 0.6,
      metalness: 0.4,
    });

    // 水平管道
    const pipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 32), pipeMaterial);
    pipe1.position.set(-2.5, 3, 0);
    pipe1.rotation.z = Math.PI / 2;
    scene.add(pipe1);

    // 垂直管道
    const pipe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 32), pipeMaterial);
    pipe2.position.set(0, 3 + 2.5, 0);
    scene.add(pipe2);

    // 拐角管道
    const cornerPipe = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.1, 16, 32, Math.PI / 2),
      pipeMaterial,
    );
    cornerPipe.position.set(0, 3, 0);
    cornerPipe.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    scene.add(cornerPipe);
  };

  // 创建粒子系统 - 优化粒子设置确保可见
  const createParticles = () => {
    // 定义L形路径点
    const pathPoints = [
      new THREE.Vector3(-5, 3, 0), // 起点
      new THREE.Vector3(0, 3, 0), // 拐角点
      new THREE.Vector3(0, 8, 0), // 终点
    ];

    // 创建平滑曲线
    const curve = new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.5);

    // 增加粒子数量，更容易看到
    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const uvs = new Float32Array(particleCount * 2);

    // 初始化粒子位置
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const i2 = i * 2;
      const point = curve.getPoint(i / particleCount);

      positions[i3] = point.x;
      positions[i3 + 1] = point.y;
      positions[i3 + 2] = point.z;

      uvs[i2] = 0;
      uvs[i2 + 1] = i / particleCount;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // 粒子材质 (简化着色器确保兼容性)
    particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x00ffff) },
      },
      vertexShader: `
      uniform float time;
      attribute vec2 uv;
      varying vec3 vColor;
      
      vec3 getPoint(float t) {
        if (t < 0.5) {
          // 水平段
          float x = -5.0 + (t * 2.0) * 5.0;
          return vec3(x, 3.0, 0.0);
        } else {
          // 垂直段
          float y = 3.0 + ((t - 0.5) * 2.0) * 5.0;
          return vec3(0.0, y, 0.0);
        }
      }
      
      void main() {
        float speed = 0.2;
        float offset = fract(uv.y + time * speed);
        vec3 newPosition = getPoint(offset);
        
        // 减小随机偏移，防止粒子偏离管道
        newPosition.x += sin(uv.y * 10.0 + time) * 0.02;
        newPosition.y += cos(uv.y * 10.0 + time) * 0.02;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        gl_PointSize = 4.0; // 增大粒子尺寸，更容易看到
        vColor = vec3(0.2, 0.8, 1.0); // 使用固定亮色，确保可见
      }
    `,
      fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        // 简化粒子形状，确保渲染
        float distance = length(gl_PointCoord - vec2(0.5));
        if (distance > 0.5) discard;
        gl_FragColor = vec4(vColor, 1.0); // 不透明，确保可见
      }
    `,
      transparent: true,
      // 调整混合模式，确保在各种背景下可见
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    // 创建粒子
    particles = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particles);

    debug.particleStatus = `已创建 ${particleCount} 个粒子`;
  };

  // 窗口大小调整
  const onWindowResize = () => {
    if (!container.value) return;

    camera.aspect = container.value.clientWidth / container.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  };

  // 动画循环
  const animate = (time: number) => {
    animationId = requestAnimationFrame(animate);

    // 更新粒子时间
    if (particleMaterial) {
      particleMaterial.uniforms.time.value = time * 0.001;
    }

    controls.update();
    renderer.render(scene, camera);
  };

  // 组件挂载时初始化
  onMounted(() => {
    // 延迟初始化，确保DOM已准备好
    setTimeout(() => {
      initScene();
      animate(0);
    }, 100);
  });

  // 组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    cancelAnimationFrame(animationId);

    if (container.value && renderer.domElement) {
      container.value.removeChild(renderer.domElement);
    }

    // 清理Three.js资源
    if (scene) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  });

  // 暴露给模板的计算属性
  const particleStatus = computed(() => debug.particleStatus);
</script>

<style scoped>
  .electric-flow-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }

  .debug-info {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 4px;
    z-index: 100;
  }
</style>
