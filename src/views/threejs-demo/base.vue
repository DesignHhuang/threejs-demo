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
  let texture

  const init = () => {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(1200, 800);

    const geometry = new THREE.PlaneGeometry( 600, 300 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
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
    texture.repeat.x = 25;
    texture.repeat.y = 2;
    texture.offset.y = 1;
    
    console.log(texture)
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
    const mesh2 = mesh.clone()
    mesh.position.x = 200;
    scene.add( mesh2 );
    //mesh.rotateZ(3.14);
    //mesh.scale.set(2, 2, 2);

    const linegeometry = new THREE.BufferGeometry().setFromPoints( path );
    const linematerial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    const curveObject = new THREE.Line( linegeometry, linematerial );

    scene.add( curveObject );
   
   
    controls = new OrbitControls( camera, renderer.domElement );

    renderer.render(scene, camera);
    //controls.update();
    refFlow.value.appendChild(renderer.domElement);
  };

  // RAF Update the screen
  function tick(): void {
    renderer.render(scene, camera);
    texture.offset.x -= 0.04
    controls.update();
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
