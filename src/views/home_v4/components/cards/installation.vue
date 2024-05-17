<template>
  <div>
    <div class="smallcard1-top">
      <div class="flex items-center">
        <img class="w-h-40" :src="installation_v4" alt="service_ticket_v4" />
        <div class="smallcard1-title">RECENT 30 DAYS INSTALLATIONS</div>
      </div>
    </div>
    <div class="flex justify-between">
      <div class="installations">
        <div class="font-b-34-600">{{ dailyGrowthCount }}</div>
        <div class="font-b-12-500-6 mt-5">
          {{ dayjs(growthData?.date[0]).format('MMM D') }} -
          {{ dayjs(growthData?.date[29]).format('MMM D YYYY') }}
        </div>
      </div>
      <div class="installations-echart" ref="chartRef"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Ref, ref, unref, computed } from 'vue';
  import { useRequest } from 'vue-request';
  import installation_v4 from '@/assets/svg/installation_v4.svg';
  import { useDeskCharts } from '/@/hooks/web/useDeskCharts';
  import dayjs from 'dayjs';
  import { getPlantDailyGrowth } from '/@/api/wattspace/powerStation';
  import { reduce } from 'lodash-es';

  const chartRef = ref<HTMLDivElement | null>(null);

  const { setOptions } = useDeskCharts(chartRef as Ref<HTMLDivElement>);

  const utcOffset = dayjs().utcOffset();
  // getPlantDailyGrowth\
  const { data: growthData } = useRequest(getPlantDailyGrowth, {
    manual: false,
    defaultParams: [{ days: 30, zoneOffsetMinutes: utcOffset }],
    onSuccess: (data) => {
      const xData = data.date;
      const dataLength = data.count.length;
      const yData = data.count.map((res, index) => {
        let returnObj: any = { value: res };
        const isLastOne = index + 1 === dataLength;
        if (isLastOne) {
          returnObj.label = {
            show: true,
            color: '#000',
            fontWeight: 600,
            fontFamily: 'Albert Sans',
          };
          returnObj.symbolSize = 12;
          returnObj.symbol = 'image://https://www.wattdesk.com/DOT.svg';
        } else {
          returnObj.symbol = 'none';
        }
        return returnObj;
      });

      setOptions({
        grid: {
          show: true,
          borderWidth: 0,
          top: 20,
          left: 1,
          right: 8,
          bottom: 1,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xData,
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
            data: yData,
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
    },
  });
  const dailyGrowthCount = computed<number>(
    () => reduce(unref(growthData)?.count, (sum, n) => sum + n, 0) || 0,
  );
</script>
<style lang="less" scoped>
  .installations {
    margin: 1.25rem 0 1.25rem 1.25rem;
  }
  .installations-echart {
    width: 8rem;
    height: 5.625rem;
    margin-right: 0.875rem;
  }
</style>
