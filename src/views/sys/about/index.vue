<template>
  <PageWrapper title="小栗子">
    <div ref="refContainer"></div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import * as THREE from 'three';
 
 const refContainer = ref()
</script>
