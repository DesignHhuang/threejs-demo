<template>
  <div>
    <div class="smallcard1-top">
      <div class="flex items-center">
        <img class="w-h-40" :src="top_sellers_v4" alt="top_sellers_v4" />
        <div class="smallcard1-title">TOP SELLERS</div>
      </div>
    </div>

    <div class="nodata" v-if="!topDistributors || topDistributors.length === 0"> No seller </div>

    <div v-else class="smallcard-echart" :key="item.id" v-for="item in topDistributors">
      <img class="top_seller_dot_v4" :src="top_seller_dot_v4" alt="top_seller_dot_v4" />
      <div class="smallcard-echart-item">
        <div class="smallcard-echart-data">
          <span
            class="font-b-12-500 text-ellipsis"
            style="max-width: 10rem"
            :title="item.distributor"
          >
            {{ item.distributor }}
          </span>
          <span class="font-b-12-500-6">{{ item.count }}</span>
        </div>
        <lineChart :max="maxDistributors" :yData="item.count" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import top_sellers_v4 from '@/assets/svg/top_sellers_v4.svg';
  import top_seller_dot_v4 from '@/assets/svg/top_seller_dot_v4.svg';
  import { useRequest } from 'vue-request';
  import { getTopDistributors } from '/@/api/wattspace/powerStation';
  import { max } from 'lodash-es';
  import lineChart from './line-chart.vue';

  const { data: topDistributors } = useRequest(getTopDistributors, {
    manual: false,
    defaultParams: [{ current: 1, size: 4 }],
  });

  const maxDistributors = computed<number>(
    () => max(unref(topDistributors).map((res) => Number(res.count))) || 0,
  );
</script>
<style lang="less" scoped>
  .top_seller_dot_v4 {
    width: 1.1875rem;
    height: 1.1875rem;
  }
</style>
