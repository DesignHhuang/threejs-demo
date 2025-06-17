<template>
  <PageWrapper>
    <div ref="refFlow" class="flow"</div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';
  import { getBoundingClientRect } from '@/utils/domUtils';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
  import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
			import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
      import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
      import Stats from 'three/addons/libs/stats.module.js';

  const refFlow = ref();

  let controls: OrbitControls;
  let camera: THREE.PerspectiveCamera;
  let flow;
  // Camera
  camera = new THREE.PerspectiveCamera(100, 1200 / 800, 1, 300);
  camera.position.set(0, 0, 200);
  //camera.position.set(0, 20, 0);
  camera.lookAt( 0, 0, 0 );

  let scene: THREE.Scene;
  // Scene
  scene = new THREE.Scene();

  let renderer: THREE.WebGLRenderer;
  let texture,texture2,texture3,composer,stats;

  const init = () => {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(1200, 800);

    const geometry = new THREE.PlaneGeometry( 600, 300 );
    const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    const curve = new THREE.CatmullRomCurve3([
	    new THREE.Vector3( -100, 100, 0 ),
	    new THREE.Vector3( -100, 100, 20),
	    new THREE.Vector3(-100, 0, 20 ),
	    new THREE.Vector3( 0, 0, 20 ),
	    new THREE.Vector3(  0, 10, 20 )
    ]);

    const path = curve.getPoints( 50 );
    const curvegeometry = new THREE.TubeGeometry( curve, 100, 3, 20, false );

    const textureLoader = new THREE.TextureLoader();
    texture = textureLoader.load('/textures/arrow1.jpg');
    // 设置阵列模式为 RepeatWrapping
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.x = 10;
    texture.repeat.y = 2;
    texture.offset.y = 1;
    //const curvematerial = new THREE.MeshMatcapMaterial( { color: 0xffffff,transparent:true,opacity:0.6} );
    const curvematerial = new THREE.MeshMatcapMaterial({
      map: texture,
      transparent: true,
      //color: 0xb6bbb8,
      side: THREE.DoubleSide,
      //opacity: 0.6,
    });
    const mesh = new THREE.Mesh( curvegeometry, curvematerial );
    //mesh.position.y = 2;
    scene.add( mesh );

    const curvegeometry2 = new THREE.TubeGeometry( curve, 100, 3, 10, false );
    const textureLoader2 = new THREE.TextureLoader();
    texture2 = textureLoader2.load('/textures/line4.png');
    // 设置阵列模式为 RepeatWrapping
    texture2.wrapS = THREE.RepeatWrapping
    texture2.wrapT = THREE.RepeatWrapping
    texture2.repeat.x = 1;
    texture2.repeat.y = 30;
    //const curvematerial = new THREE.MeshMatcapMaterial( { color: 0xffffff,transparent:true,opacity:0.6} );
    const curvematerial2 = new THREE.MeshMatcapMaterial({
      map: texture2,
      transparent: true,
      color: 0xffffff,
      side: THREE.DoubleSide,
      //opacity: 0.6,
    });
    const mesh2 = new THREE.Mesh( curvegeometry2, curvematerial2 )
    mesh2.position.x = 200;
    scene.add( mesh2 );

    const params = {
				threshold: 0,
				strength: 1,
				radius: 0,
				exposure: 1
			};

    const renderScene = new RenderPass( scene, camera );

				const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.threshold;
				bloomPass.strength = params.strength;
				bloomPass.radius = params.radius;

				const outputPass = new OutputPass();

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );
				composer.addPass( outputPass );
        composer.setSize( 1200, 800 );
				//

				stats = new Stats();
				



    //mesh.rotateZ(3.14);
    //mesh.scale.set(2, 2, 2);

    const textureLoader3 = new THREE.TextureLoader();
    texture3 = textureLoader3.load('/textures/arrow.png');
    // 设置阵列模式为 RepeatWrapping
    texture3.wrapS = THREE.RepeatWrapping
    texture3.wrapT = THREE.RepeatWrapping
    texture3.repeat.x = 10;
    texture3.repeat.y = 3;
    texture3.offset.y = 1;
    //const curvematerial = new THREE.MeshMatcapMaterial( { color: 0xffffff,transparent:true,opacity:0.6} );
    const curvematerial3 = new THREE.MeshMatcapMaterial({
      map: texture3,
      transparent: true,
      color: 0xe5edef,
      side: THREE.DoubleSide,
      opacity: 0.8,
    });
    const mesh3 = new THREE.Mesh( curvegeometry, curvematerial3 );
    mesh3.position.y = -120;
    scene.add( mesh3 );

    const linegeometry = new THREE.BufferGeometry().setFromPoints( path );
    const linematerial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    const curveObject = new THREE.Line( linegeometry, linematerial );

    scene.add( curveObject );
   
   
    controls = new OrbitControls( camera, renderer.domElement );

    renderer.render(scene, camera);
    //controls.update();
    refFlow.value.appendChild(renderer.domElement);

    refFlow.value.appendChild( stats.dom );
  };

  // RAF Update the screen
  function tick(): void {
    renderer.render(scene, camera);
    texture.offset.x -= 0.01
    texture2.offset.x -= 0.5 / 200
    texture3.offset.x -= 0.015
    controls.update();
    stats.update();
				composer.render();
    window.requestAnimationFrame(tick);
  }

  onMounted(() => {
    const box = getBoundingClientRect(refFlow.value);
    console.log(box);
    init();
    requestAnimationFrame(tick);
  });
</script>

<style lang="less" scoped>
  .flow {
    width: 1200px;
    height: 800px;
    border: 1px solid red;
  }
</style>
