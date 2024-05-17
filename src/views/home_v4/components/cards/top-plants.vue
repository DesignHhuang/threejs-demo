<template>
  <div>
    <div class="smallcard1-top">
      <div class="flex items-center">
        <img class="w-h-40" :src="top_plants_v4" alt="top_plants_v4" />
        <div class="smallcard1-title">TOP PLANTS</div>
      </div>
    </div>
    <div class="nodata" v-if="!topPlants || topPlants.length === 0"> No Plants </div>
    <div v-else class="smallcard-echart" :key="item.id" v-for="item in topPlants">
      <div class="top_plant_dot"></div>
      <div class="smallcard-echart-item">
        <div class="smallcard-echart-data">
          <span
            class="font-b-12-500 text-ellipsis"
            style="max-width: 10rem"
            :title="item.distributor"
          >
            {{ item.distributor }}
          </span>
          <span class="font-b-12-500-6">{{ item.capacity }}</span>
        </div>
        <lineChart :max="maxPlants" :yData="Number(item.capacity)" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import top_plants_v4 from '@/assets/svg/top_plants_v4.svg';
  import { useRequest } from 'vue-request';
  import { getTopPlants } from '/@/api/wattspace/powerStation';
  import { max } from 'lodash-es';
  import lineChart from './line-chart.vue';

  const { data: topPlants } = useRequest(getTopPlants, {
    manual: false,
    defaultParams: [{ current: 1, size: 4 }],
  });
  const maxPlants = computed<number>(
    () => max(unref(topPlants).map((res) => Number(res.capacity))) || 0,
  );
</script>
<style lang="less" scoped>
  .top_plant_dot {
    min-width: 0.8125rem;
    min-height: 0.8125rem;
    border-radius: 0.125rem;
    border: 1px solid #fff;
    background: #000;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.25);
  }
</style>
