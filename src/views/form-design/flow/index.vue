<template>
  <div class="p-3">
    <div class="flex gap-xl">
      <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
        <div class="w-full h-360px cursor-pointer" ref="containerRef1"></div>
        <a-button type="primary" @click="start1()">开启流动特效1</a-button>
      </div>
      <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
        <div class="w-full h-360px cursor-pointer" ref="containerRef2"></div>
        <a-button type="primary" @click="start2()">开启流动特效2</a-button>
      </div>
      <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
        <div class="w-full h-360px cursor-pointer" ref="containerRef3"></div>
        <a-button type="primary" @click="start3()">开启流动特效3</a-button>
      </div>
    </div>
    <div class="flex gap-xl">
      <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
        <div class="w-full h-360px cursor-pointer" ref="containerRef4"></div>
        <a-button type="primary" @click="start4()">开启流动特效4</a-button>
      </div>
      <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
        <div class="w-full h-360px cursor-pointer" ref="containerRef5"></div>
        <a-button type="primary" @click="start5()">开启流动特效5</a-button>
      </div>
      <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
        <div class="w-full h-360px cursor-pointer" ref="containerRef6"></div>
        <a-button type="primary" @click="start6()">开启流动特效6</a-button>
      </div>
    </div>
    <div class="flex gap-xl">
      <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
        <div class="w-full h-360px cursor-pointer" ref="containerRef7"></div>
        <a-button type="primary" @click="start7()">开启流动特效7</a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { App } from './app';
  import { options1, options2, options3, options4, options5, options6, options7 } from './options';

  const containerRef1 = ref();
  const containerRef2 = ref();
  const containerRef3 = ref();
  const containerRef4 = ref();
  const containerRef5 = ref();
  const containerRef6 = ref();
  const containerRef7 = ref();

  const start1 = () => {
    const myApp1 = new App(containerRef1.value, options1);
    myApp1.init();
  };
  const start2 = () => {
    const myApp2 = new App(containerRef2.value, options2);
    myApp2.init();
  };
  const start3 = () => {
    const myApp3 = new App(containerRef3.value, options3);
    myApp3.init();
  };
  const start4 = () => {
    const myApp4 = new App(containerRef4.value, options4);
    myApp4.init();
  };
  const start5 = () => {
    const myApp5 = new App(containerRef5.value, options5);
    myApp5.init();
  };
  const start6 = () => {
    const myApp6 = new App(containerRef6.value, options6);
    myApp6.init();
  };
  const start7 = () => {
    const myApp7 = new App(containerRef7.value, options7);
    myApp7.init();
  };

  onMounted(() => {});
</script>
