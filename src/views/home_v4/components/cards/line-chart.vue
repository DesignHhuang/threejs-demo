<template>
  <div ref="itemRef" :style="{ height: '6px' }"></div>
</template>
<script lang="ts" setup>
  import { Ref, ref, watchEffect } from 'vue';
  import { useDeskCharts } from '/@/hooks/web/useDeskCharts';

  const props = defineProps({
    max: { type: Number, default: 100 },
    yData: { type: Number, default: 50 },
  });

  const itemRef = ref();
  const { setOptions } = useDeskCharts(itemRef as Ref<HTMLDivElement>);

  watchEffect(() => {
    setOptions({
      color: '#000000',
      grid: {
        show: true,
        borderWidth: 0,
        top: 68,
        left: 0,
        right: 0,
      },
      xAxis: {
        type: 'value',
        show: false,
        min: 0,
        max: props.max,
      },
      yAxis: {
        type: 'category',
        data: ['data'],
        show: false,
      },
      series: {
        type: 'bar',
        data: [props.yData],
        showBackground: true,
        backgroundStyle: {
          color: '#000000',
          opacity: 0.2,
          borderRadius: 10,
        },
        itemStyle: { borderRadius: 10 },
        barMaxWidth: 2,
      },
    });
  });
</script>
