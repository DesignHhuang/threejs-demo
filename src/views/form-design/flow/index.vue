<template>
  <div class="flex gap-2xl p-6">
    <div class="w-1/2 h-500px" ref="containerRef1"></div>
    <div class="w-1/2 h-500px" ref="containerRef2"></div>
  </div>
  <div class="flex gap-2xl">
    <div class="w-1/2 h-500px" ref="containerRef3"></div>
    <div class="w-1/2 h-500px" ref="containerRef4"></div>
  </div>
  <div class="flex gap-2xl">
    <div class="w-1/2 h-500px" ref="containerRef5"></div>
    <div class="w-1/2 h-500px" ref="containerRef6"></div>
  </div>
  <div class="flex gap-2xl">
    <div class="w-1/2 h-500px" ref="containerRef7"></div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { mountainDistortion } from './distortions';
  import { App } from './app';

  const containerRef1 = ref();

  onMounted(() => {
    const options = {
      onSpeedUp: (ev) => {},
      onSlowDown: (ev) => {},
      distortion: mountainDistortion,
      length: 400,
      roadWidth: 9,
      islandWidth: 2,
      lanesPerRoad: 3,
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 50,
      lightPairsPerRoadWay: 50,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7],
      movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160],
      carLightsLength: [400 * 0.05, 400 * 0.15],
      carLightsRadius: [0.05, 0.14],
      carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.2, 0.2],
      carFloorSeparation: [0.05, 1],
      colors: {
        roadColor: 0x080808,
        islandColor: 0x0a0a0a,
        background: 0x000000,
        shoulderLines: 0x131318,
        brokenLines: 0x131318,
        leftCars: [0xff102a, 0xeb383e, 0xff102a],
        rightCars: [0xdadafa, 0xbebae3, 0x8f97e4],
        sticks: 0xdadafa,
      },
    };

    const myApp = new App(containerRef1.value, options);
    myApp.init();
  });
</script>
