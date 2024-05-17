<template>
  <div
    class="plant-item"
    :style="{ background: runningStatus.name === 'Normal' ? '#0078D4' : '#FF2D55' }"
  >
    <div class="flex items-center">
      <div class="company-logo">{{ String(plantInfo.plantName)[0].toUpperCase() }}</div>
      <div class="company-info">
        <div class="font-w-18-600">{{ plantInfo.plantName }}</div>
        <div class="flex items-center">
          <img class="crad-plant-info-icon mr-1" :src="comStatus.icon" alt="comstatus_v4" />
          <div class="font-w-10-600 mr-1">{{ comStatus.name }}</div>
          <img class="crad-plant-divider m-1" :src="divider_v4" alt="divider_v4" />
          <img
            class="crad-plant-info-icon mr-1"
            :src="runningStatus.icon"
            alt="plant_status_ok_v4"
          />
          <div class="font-w-10-600 mr-1">{{ runningStatus.name }}</div>
          <img class="crad-plant-divider m-1" :src="divider_v4" alt="divider_v4" />
          <div class="font-w-10-600">{{ plantInfo.plantTypeName || 'Battery System' }}</div>
        </div>
      </div>
    </div>
    <div class="flex items-center">
      <div class="echarts-data" ref="chartRef"></div>
      <div class="icon-btn-margin">
        <div class="plant-card-icon-con" @click="location">
          <img
            class="plant-card-icon-location"
            :src="runningStatus.location_icon"
            alt="status_location_v4"
          />
        </div>
      </div>
      <div class="icon-btn-margin">
        <div class="plant-card-icon-con" @click="go(`/plantList/${plantInfo.plantId}/overView`)">
          <Icon
            icon="plant_card_detail_v4|svg"
            :size="1.5"
            :style="{ color: runningStatus.name === 'Normal' ? '#0078D4' : '#FF2D55' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, Ref, ref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import offline_v4 from '@/assets/svg/offline_v4.svg';
  import online_v4 from '@/assets/svg/online_v4.svg';
  import comstatus_partially_v4 from '@/assets/svg/comstatus_partially_v4.svg';
  import device_unbound_v4 from '@/assets/svg/device_unbound_v4.svg';
  import plant_status_ok_v4 from '@/assets/svg/plant_status_ok_v4.svg';
  import plant_status_error_v4 from '@/assets/svg/plant_status_error_v4.svg';
  import divider_v4 from '@/assets/svg/divider_v4.svg';
  import status_ok_location_v4 from '@/assets/svg/status_ok_location_v4.svg';
  import status_error_location_v4 from '@/assets/svg/status_error_location_v4.svg';
  import { useDeskCharts } from '/@/hooks/web/useDeskCharts';
  import { useRequest } from 'vue-request';
  import { getPlantInfoById } from '/@/api/wattspace/powerStation';
  import { useGo } from '/@/hooks/web/usePage';

  const props = defineProps({ plantId: { type: String, default: '' } });

  const emit = defineEmits(['location']);

  const chartRef = ref<HTMLDivElement | null>(null);

  const go = useGo();
  const { setOptions } = useDeskCharts(chartRef as Ref<HTMLDivElement>);

  const plantInfo = ref({
    plantId: '',
    plantName: 'plant name',
    plantTypeName: 'plant type',
    runningStatus: 0,
    comStatus: -1,
  });

  const runningStatus = computed(() =>
    plantInfo.value.runningStatus === 0
      ? { name: 'Normal', icon: plant_status_ok_v4, location_icon: status_ok_location_v4 }
      : { name: 'Attention', icon: plant_status_error_v4, location_icon: status_error_location_v4 },
  );

  // -1:Incomplete 0:离线 1:在线 2:部分在线
  const comStatus = computed(() => {
    let result = { name: 'Offline', icon: offline_v4 };
    switch (plantInfo.value.comStatus) {
      case 0:
        result = { name: 'Offline', icon: offline_v4 };
        break;
      case 1:
        result = { name: 'Online', icon: online_v4 };
        break;
      case 2:
        result = { name: 'Partially offline', icon: comstatus_partially_v4 };
        break;
      case -1:
        result = { name: 'Unbound device', icon: device_unbound_v4 };
        break;
    }
    return result;
  });

  const location = () => {
    emit('location');
  };

  useRequest(getPlantInfoById, {
    manual: false,
    defaultParams: [{ plantIds: [props.plantId] }],
    onSuccess: (data) => {
      plantInfo.value = data[0];
      if (data[0].realTimePowers) {
        const realTimePowers = data[0].realTimePowers[0].trend;
        const echartData = realTimePowers.map((res, index) => ({ id: index, value: res }));
        const xData = echartData.map((res) => res.id);
        const yData = echartData.map((res) => {
          if (res.id + 1 === echartData.length) {
            return {
              label: {
                show: true,
                color: '#ffffff',
                opacity: 0.8,
                distance: 0,
                offset: [-10, 0],
                formatter: '{c}kW',
                fontWeight: 600,
                fontSize: 10,
                fontFamily: 'Albert Sans',
              },
              value: res.value,
              symbolSize: 12,
              symbolKeepAspect: true,
              symbol: 'image://https://www.wattdesk.com/dot-white.svg',
            };
          } else {
            return { value: res.value, symbol: 'none' };
          }
        });

        setOptions({
          grid: {
            show: true,
            borderWidth: 0,
            top: 14,
            left: 2,
            right: 6,
            bottom: 14,
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xData,
            axisLine: {
              lineStyle: {
                color: '#FFFFFF',
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
                color: '#FFFFFF',
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
                      color: 'rgba(255, 255, 255, 0.8)',
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
      }
    },
  });
</script>
<style lang="less" scoped>
  .saving-card-con {
    margin: 1.5rem 1.25rem 1.5rem 1.25rem;
    .middle {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }

  .plant-card-icon-con {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    .plant-card-icon-location {
      width: 1.125rem;
      height: 1.25rem;
    }

    &:hover {
      scale: 1.1;
    }
  }
</style>
