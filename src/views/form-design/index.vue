<template>
  <PageWrapper dense contentFullHeight fixedHeight>
    <div id="lineContainer"></div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import { App } from './app';

  onMounted(() => {
    const lineContainer = document.getElementById('lineContainer');

    const options = {
      length: 400,
      width: 20,
      roadWidth: 9,
      islandWidth: 2,
      nPairs: 50,
      roadSections: 3,
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
