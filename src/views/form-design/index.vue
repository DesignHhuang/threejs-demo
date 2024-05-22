<template>
  <PageWrapper dense contentFullHeight fixedHeight>
    <div id="lineContainer"></div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import { App } from './app';
  import * as THREE from 'three';

  const distortion_uniforms = {
    uDistortionX: new THREE.Uniform(new THREE.Vector2(80, 3)),
    uDistortionY: new THREE.Uniform(new THREE.Vector2(-40, 2.5)),
  };

  const distortion_vertex = `
#define PI 3.14159265358979
  uniform vec2 uDistortionX;
  uniform vec2 uDistortionY;

    float nsin(float val){
    return sin(val) * 0.5+0.5;
    }
  vec3 getDistortion(float progress){
        progress = clamp(progress, 0.,1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        return vec3( 
            xAmp * nsin(progress* PI * xFreq   - PI / 2. ) ,
            yAmp * nsin(progress * PI *yFreq - PI / 2.  ) ,
            0.
        );
    }
`;

  const myCustomDistortion = {
    uniforms: distortion_uniforms,
    getDistortion: distortion_vertex,
  };

  onMounted(() => {
    const lineContainer = document.getElementById('lineContainer');

    const options = {
      length: 400,
      width: 20,
      roadWidth: 9,
      islandWidth: 2,
      nPairs: 50,
      roadSections: 3,
      distortion: myCustomDistortion,
    };

    const myApp = new App(lineContainer, options);
    myApp.loadAssets().then(myApp.init);
  });
</script>

<style lang="less" scoped>
  #lineContainer {
    width: 1000px;
    height: 600px;
    border: 1px solid red;
  }
</style>
