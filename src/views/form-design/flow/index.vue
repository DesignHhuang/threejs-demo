<template>
  <div class="flex gap-xl p-3">
    <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
      <div class="w-full h-360px cursor-pointer" ref="containerRef1"></div>
      <a-button type="primary">开启流动效果1</a-button>
    </div>
    <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
      <div class="w-full h-360px cursor-pointer" ref="containerRef2"></div>
      <a-button type="primary">开启流动效果2</a-button>
    </div>
    <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
      <div class="w-full h-360px cursor-pointer" ref="containerRef3"></div>
      <a-button type="primary">开启流动效果3</a-button>
    </div>
  </div>
  <div class="flex gap-xl">
    <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
      <div class="w-full h-360px cursor-pointer" ref="containerRef4"></div>
      <a-button type="primary">开启流动效果4</a-button>
    </div>
    <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
      <div class="w-full h-360px cursor-pointer" ref="containerRef5"></div>
      <a-button type="primary">开启流动效果5</a-button>
    </div>
    <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
      <div class="w-full h-360px cursor-pointer" ref="containerRef6"></div>
      <a-button type="primary">开启流动效果6</a-button>
    </div>
  </div>
  <div class="flex gap-xl">
    <div class="w-1/3 flex flex-col gap-2 items-center h-400px">
      <div class="w-full h-360px cursor-pointer" ref="containerRef7"></div>
      <a-button type="primary">开启流动效果7</a-button>
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

  onMounted(() => {
    const myApp1 = new App(containerRef1.value, options1);
    myApp1.init();

    const myApp2 = new App(containerRef2.value, options2);
    myApp2.init();

    const myApp3 = new App(containerRef3.value, options3);
    myApp3.init();

    const myApp4 = new App(containerRef4.value, options4);
    myApp4.init();

    const myApp5 = new App(containerRef5.value, options5);
    myApp5.init();

    const myApp6 = new App(containerRef6.value, options6);
    myApp6.init();

    const myApp7 = new App(containerRef7.value, options7);
    myApp7.init();
  });
</script>
