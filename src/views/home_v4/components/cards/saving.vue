<template>
  <div>
    <div class="smallcard1-top">
      <div class="flex items-center">
        <img class="w-h-40" :src="saving_v4" alt="service_ticket_v4" />
        <div class="smallcard1-title">TOTAL SAVINGS</div>
      </div>
    </div>
    <div class="flex justify-between">
      <div class="saving-card-con">
        <div class="flex items-center">
          <img class="data-icon" :src="saving_coal_v4" alt="saving_coal_v4" />
          <div class="saving-item">
            <span class="font-b-12-600">{{ plantEsg?.carbons.toFixed(1) }}KG</span>
            <span class="font-b-12-500 ml-1">COAL</span>
          </div>
        </div>
        <div class="flex items-center middle">
          <img class="data-icon" :src="saving_tree_v4" alt="saving_tree_v4" />
          <div class="saving-item">
            <span class="font-b-12-600">{{ plantEsg?.trees.toFixed(1) }}</span>
            <span class="font-b-12-500 ml-1">TREES</span>
          </div>
        </div>
        <div class="flex items-center">
          <img class="data-icon" :src="saving_co2_v4" alt="saving_co2_v4" />
          <div class="saving-item">
            <span class="font-b-12-600">{{ plantEsg?.dioxide.toFixed(1) }}KG</span>
            <span class="font-b-12-500 ml-1">CO2</span>
          </div>
        </div>
      </div>
      <div class="saving-echart" ref="chartRef"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, Ref, ref } from 'vue';
  import { useRequest } from 'vue-request';
  import { useDeskCharts } from '/@/hooks/web/useDeskCharts';
  import saving_v4 from '@/assets/svg/saving_v4.svg';
  import saving_coal_v4 from '@/assets/svg/saving_coal_v4.svg';
  import saving_tree_v4 from '@/assets/svg/saving_tree_v4.svg';
  import saving_co2_v4 from '@/assets/svg/saving_co2_v4.svg';
  import { getPlantEsg } from '/@/api/wattspace/powerStation';

  const chartRef = ref<HTMLDivElement | null>(null);

  const { setOptions } = useDeskCharts(chartRef as Ref<HTMLDivElement>);

  // getPlantEsg
  const { data: plantEsg } = useRequest(getPlantEsg, {
    manual: false,
  });

  onMounted(() => {
    setOptions({
      grid: {
        show: true,
        borderWidth: 0,
        top: 20,
        left: 2,
        right: 8,
        bottom: 1,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.2)',
            type: [2, 3],
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          data: [
            { value: 25, symbol: 'none' },
            { value: 23, symbol: 'none' },
            { value: 15, symbol: 'none' },
            { value: 19, symbol: 'none' },
            { value: 18, symbol: 'none' },
            { value: 27, symbol: 'none' },
            {
              value: 25,
              symbolSize: 12,
              symbolKeepAspect: true,
              symbol: 'image://https://www.wattdesk.com/DOT.svg',
            },
          ],
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#0078D4',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: '#56bff0',
                },
                {
                  offset: 1,
                  color: 'rgba(255, 255, 255, 0)',
                },
              ],
            },
          },
        },
      ],
    });
  });
</script>
<style lang="less" scoped>
  .saving-card-con {
    margin: 1.5rem 0 1.5rem 1.25rem;
    .data-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
    .middle {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }
  .saving-item {
    display: flex;
    align-items: center;
    margin-left: 0.75rem;
  }
  .saving-echart {
    width: 8.75rem;
    height: 5.625rem;
    margin-right: 0.875rem;
  }
</style>
