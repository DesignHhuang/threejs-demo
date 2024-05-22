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
  // Camera
  camera = new THREE.PerspectiveCamera(100, 1200 / 800, 1, 300);
  camera.position.set(0, 0, 200);
  //camera.position.set(0, 20, 0);
camera.lookAt( 0, 0, 0 );

  let scene: THREE.Scene;
  // Scene
  scene = new THREE.Scene();

  let renderer: THREE.WebGLRenderer;


  const init = () => {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(1200, 800);

    const geometry = new THREE.PlaneGeometry( 600, 300 );
    const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    //plane.position.set(0, 0, 100);
    scene.add( plane );

    //Create a closed wavey loop
/* const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( -10, 0, 10 ),
	new THREE.Vector3( -5, 5, 5 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 5, -5, 5 ),
	new THREE.Vector3( 10, 0, 10 )
] );

const points = curve.getPoints( 50 );
const curvegeometry = new THREE.BufferGeometry().setFromPoints( points );

const curvematerial = new THREE.LineBasicMaterial( { color: 0xff0000 } );

const curveObject = new THREE.Line( curvegeometry, curvematerial );
scene.add( curveObject ); */

    /* const path = new CustomSinCurve( 10 );
const geometry = new THREE.TubeGeometry( path, 20, 2, 8, false );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ); */
/* const mesh = new THREE.Mesh( geometry, material ); */


const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( -100, 100, 0 ),
	new THREE.Vector3( -100, 100, 20),
	new THREE.Vector3(-100, 0, 20 ),
	new THREE.Vector3( 0, 0, 20 ),
	new THREE.Vector3(  0, 10, 20 )
] );

const path = curve.getPoints( 50 );
const curvegeometry = new THREE.TubeGeometry( curve, 100, 3, 20, false );
const curvematerial = new THREE.MeshMatcapMaterial( { color: 0xffffff,transparent:true,opacity:0.6} );
const mesh = new THREE.Mesh( curvegeometry, curvematerial );

const linegeometry = new THREE.BufferGeometry().setFromPoints( path );
const linematerial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
const curveObject = new THREE.Line( linegeometry, linematerial );

scene.add( curveObject );
scene.add( mesh );
   
    controls = new OrbitControls( camera, renderer.domElement );

    renderer.render(scene, camera);
    //controls.update();
    refFlow.value.appendChild(renderer.domElement);
  };

  // RAF Update the screen
  function tick(): void {
    renderer.render(scene, camera);
    //controls.update();
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
