<template>
  <PageWrapper>
    <div id="flow"></div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { PageWrapper } from '@/components/Page';
</script>

<style lang="less" scoped>
  #flow {
    width: 1200px;
    height: 800px;
    border: 1px solid red;
  }
  canvas {
    width: 100%;
    height: 100%;
  }
</style>
