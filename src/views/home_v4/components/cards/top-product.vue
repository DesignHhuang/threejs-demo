<template>
  <div>
    <div class="smallcard1-top">
      <div class="flex items-center">
        <img class="w-h-40" :src="top_product_v4" alt="service_ticket_v4" />
        <div class="smallcard1-title">TOP PRODUCT</div>
      </div>
    </div>
    <div class="nodata" v-if="!topProducts || topProducts.length === 0"> No product </div>
    <template v-else>
      <div class="product-echart" ref="chartRef"></div>
      <div class="top-product-con">
        <div class="flex items-center" v-if="threeProducts[0]">
          <img class="data-icon" :src="top_product_1_v4" alt="top_product_1_v4" />
          <div class="font-b-12-500 info-middle">{{ threeProducts[0].percent }}</div>
          <div class="font-b-12-600">{{ threeProducts[0].batOuterModel }}</div>
        </div>
        <div class="flex items-center item-middle" v-if="threeProducts[1]">
          <img class="data-icon" :src="top_product_2_v4" alt="top_product_2_v4" />
          <div class="font-b-12-500 info-middle">{{ threeProducts[1].percent }}</div>
          <div class="font-b-12-600">{{ threeProducts[1].batOuterModel }}</div>
        </div>
        <div class="flex items-center" v-if="threeProducts[2]">
          <img class="data-icon" :src="top_product_3_v4" alt="top_product_3_v4" />
          <div class="font-b-12-500 info-middle">{{ threeProducts[2].percent }}</div>
          <div class="font-b-12-600">{{ threeProducts[2].batOuterModel }}</div>
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { computed, Ref, ref } from 'vue';
  import { useDeskCharts } from '/@/hooks/web/useDeskCharts';
  import top_product_v4 from '@/assets/svg/top_product_v4.svg';
  import top_product_1_v4 from '@/assets/svg/top_product_1_v4.svg';
  import top_product_2_v4 from '@/assets/svg/top_product_2_v4.svg';
  import top_product_3_v4 from '@/assets/svg/top_product_3_v4.svg';
  import { useRequest } from 'vue-request';
  import { getTopProducts } from '/@/api/wattspace/powerStation';
  import { take } from 'lodash-es';

  const chartRef = ref<HTMLDivElement | null>(null);

  const { setOptions } = useDeskCharts(chartRef as Ref<HTMLDivElement>);

  const { data: topProducts } = useRequest(getTopProducts, {
    manual: false,
    defaultParams: [{ current: 1, size: 3 }],
    onSuccess: (data) => {
      const yData = data.map((res) => res.percent.split('%')[0]);
      const serieData = yData.map((res, index) => {
        const level = 4 - index;
        let barWidth = 4;
        let color = '#007AFF';
        let shadowColor = '#fff';
        let borderRadius = 2;
        let shadowOffsetX = 2;
        switch (level) {
          case 1:
            barWidth = 6;
            color = '#00000014';
            borderRadius = 3;
            break;
          case 2:
            barWidth = 4;
            color = '#0078D4';
            shadowOffsetX = 2;
            break;
          case 3:
            barWidth = 4;
            color = '#00C7BE';
            shadowOffsetX = 2;
            break;
          case 4:
            barWidth = 4;
            color = '#007AFF';
            shadowOffsetX = 2;
            break;
        }
        return {
          name: level === 1 ? 'other' : `top${index + 1}`,
          type: 'bar',
          stack: 'total',
          barWidth,
          data: [
            {
              value: Number(res),
              itemStyle:
                level === 1
                  ? {
                      color,
                      borderRadius,
                      shadowColor,
                    }
                  : {
                      color,
                      borderRadius,
                      shadowColor,
                      shadowOffsetX,
                    },
            },
          ],
          zlevel: 4 - index,
        };
      });
      setOptions({
        grid: {
          show: true,
          borderWidth: 0,
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 100,
          show: false,
        },
        yAxis: {
          type: 'category',
          show: false,
        },
        series: serieData,
      });
    },
  });

  const threeProducts = computed(() =>
    topProducts.value.length > 3 ? take(topProducts.value, 3) : topProducts.value,
  );
</script>
<style lang="less" scoped>
  .product-echart {
    margin-top: 0.625rem;
    height: 0.375rem;
    padding: 0 1.25rem;
  }
  .top-product-con {
    margin: 1.125rem 1.25rem 1.5rem 1.25rem;
    .data-icon {
      width: 1rem;
      height: 1rem;
    }

    .item-middle {
      margin-top: 0.625rem;
      margin-bottom: 0.625rem;
    }
    .info-middle {
      margin-left: 0.375rem;
      margin-right: 0.5rem;
    }
  }
</style>
