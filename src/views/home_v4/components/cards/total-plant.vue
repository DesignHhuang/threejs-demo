<template>
  <div>
    <div class="total-plants-card-top">
      <img class="home_total_plant_v4" :src="home_total_plant_v4" alt="home_total_plant_v4" />
      <div class="total-plants-info">
        <div class="total-plants">TOTAL PLANTS</div>
        <div class="total-plants-number">{{ plantStatistics?.totalPlantCount || 0 }}</div>
      </div>
    </div>
    <div class="total-plants-card-btn-group">
      <div class="btn-285" @click="searchPlantList('com', 0)">
        <img class="ml-4 w-h-40" :src="offline_v4" alt="offline_v4" />
        <div class="btn-285-text">
          <span class="font-b-16-600 mr-2">{{ plantStatistics?.totalOfflinePlantCount }}</span>
          <span class="font-b-16-500-6 ml-2">Offline</span>
        </div>
      </div>
      <div class="btn-285" @click="searchPlantList('status', 1)">
        <img class="ml-4 w-h-40" :src="attention_v4" alt="attention_v4" />
        <div class="btn-285-text">
          <span class="font-b-16-600 mr-2">{{ plantStatistics?.totalWarnPlantCount }}</span>
          <span class="font-b-16-500-6 ml-2">Need attention</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useFilterStore } from '/@/store/modules/filters';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRequest } from 'vue-request';
  import { getPlantStatistics } from '/@/api/wattspace/powerStation';
  import home_total_plant_v4 from '@/assets/svg/home_total_plant_v4.svg';
  import offline_v4 from '@/assets/svg/offline_v4.svg';
  import attention_v4 from '@/assets/svg/attention_v4.svg';

  const useFilters = useFilterStore();
  const go = useGo();

  // getPlantStatistics
  const { data: plantStatistics } = useRequest(getPlantStatistics, {
    manual: false,
  });

  const searchPlantList = (type, status) => {
    // 重置plantlist 中的filters
    useFilters.resetPlantListFilters();
    // 根据新的条件计算header中新的filter属性值
    useFilters.computedPlantListFilter(type, status);
    // 根据header 的状态最终确定filters
    useFilters.setPlantListFilters('');
    go('/plantList/index');
  };
</script>
<style lang="less" scoped>
  .total-plants-card-top {
    display: flex;
    align-items: center;
    .home_total_plant_v4 {
      width: 6.25rem;
      height: 6.25rem;
    }
    .total-plants-info {
      height: 6.25rem;
    }
    .total-plants {
      color: #00000099;
      font-size: 0.75rem;
      font-weight: 700;
      height: 1rem;
      line-height: 1rem;
      margin-top: 1rem;
    }
    .total-plants-number {
      color: #000000;
      font-size: 3.125rem;
      font-weight: 600;
    }
  }
  .total-plants-card-btn-group {
    display: flex;
    padding: 0 0.625rem;
    justify-content: space-between;

    .btn-285 {
      display: flex;
      align-items: center;
      background: #00000008;
      width: 17.8125rem;
      height: 3.125rem;
      border-radius: 0.625rem;
      padding: 1rem;
      cursor: pointer;

      &:hover {
        background: #00000014;
      }

      .btn-285-text {
        flex: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
