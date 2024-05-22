<template>
  <div class="p-4">
    <div id="line-flow"> </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { App } from './app';

  onMounted(() => {
    const container = document.getElementById('line-flow');

    const options = {
      length: 400,
      width: 20,
      roadWidth: 9,
      islandWidth: 2,
      nPairs: 50,
      roadSections: 3,
    };

    const myApp = new App(container, options);
    console.log(myApp);
    myApp.loadAssets().then(myApp.init);
  });
</script>

<style lang="less" scoped>
  #line-flow {
    width: 1000px;
    height: 600px;
    border: 1px solid red;
  }
</style>
