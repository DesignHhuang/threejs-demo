<template>
  <div class="overview-power-chart">
    <div class="power-chart-header">
      <template v-if="subSysList.length > 0">
        <a-select
          v-model:value="subSysId"
          :options="subSystems"
          v-if="subSysList && subSysList.length > 3"
        />
        <Segmented v-else v-model:value="subSysId" :options="subSystems" />
      </template>
      <a-input-group compact style="width: unset">
        <a-select v-model:value="timeDimension" class="data-select" style="width: 98px">
          <a-select-option value="hour"> TIME </a-select-option>
          <a-select-option value="date"> DATE </a-select-option>
          <a-select-option value="month"> MONTH </a-select-option>
          <a-select-option value="year"> YEAR </a-select-option>
        </a-select>
        <a-form-item-rest>
          <template v-if="timeDimension === 'hour'">
            <DatePicker
              :show-time="{ format: 'HH' }"
              :disabled-date="disabledDate"
              :disabled-time="disabledDateTime"
              v-model:value="dateValue"
              :allowClear="false"
              :show-now="false"
              format="YYYY-MM-DD HH"
            />
          </template>
          <template v-else>
            <DatePicker
              :picker="timeDimension"
              :disabled-date="disabledDate"
              v-model:value="dateValue"
              :allowClear="false"
              :showToday="false"
            />
          </template>
        </a-form-item-rest>
      </a-input-group>
    </div>
    <div class="power-overview">
      <div v-show="showEcharts" ref="chartRef" :style="{ height: '98%', width: '100%' }"></div>
      <Empty v-show="!showEcharts" :description="description" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, Ref, watch, watchEffect } from 'vue';
  import { Segmented, DatePicker, Empty } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import {
    covertData,
    covertXData,
    getEchartsOptions,
    getHeaterOptions,
    getNewEchartsOptions,
    getNewHeaterOptions,
  } from './useStatistics';
  import { useRequest } from 'vue-request';
  import { formatToDate, formatToHour, formatToMonth } from '/@/utils/dateUtil';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getHeaterChartsInfo, searchChartsInfo } from '/@/api/wattspace/powerStation';

  const props = defineProps({
    subSysList: { type: Array as PropType<any[]>, default: () => [] },
    timezone: { type: String, default: 'Asia/Shanghai' },
  });

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const showEcharts = ref(true);
  const normalization = ref(false); // 原版中的数据归一化处理，这里不使用
  const description = ref('');

  // 获取batids -->  获取所有的子系统信息
  const subSysId = ref();
  const subSys = computed(() => props.subSysList.find((res) => res.subSysId === subSysId.value));
  const subSystems = computed(() =>
    props.subSysList.map((res, index) => ({
      value: res.subSysId,
      label: res.type ? 'Heater' : `Battery #${index + 1}`,
    })),
  );

  watchEffect(() => {
    if (props.subSysList.length > 0) {
      subSysId.value = props.subSysList[0]?.subSysId;
    }
  });

  const timeDimension = ref<any>('date');
  const dateValue = ref(dayjs());

  // datepicker中不可选择项
  const disabledDate = (current: Dayjs) => {
    return current > dayjs().endOf('day');
  };
  const range = (start: number, end: number) => {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };
  // timepicker中不可选择项
  const disabledDateTime = (data) => {
    const sameDate = data.format('DD/MM/YYYY') === dayjs().format('DD/MM/YYYY');
    return {
      disabledHours: () => (sameDate ? range(dayjs().hour() + 1, 24) : []),
    };
  };

  // 图表数据处理 start==========================================================================
  const pollingInterval = computed(() =>
    unref(timeDimension) === 'hour' ? 5000 : unref(timeDimension) === 'date' ? 120000 : 3600000,
  );
  const handleData = (responseData, msg, timely) => {
    if (!responseData) {
      showEcharts.value = false;
      description.value = msg;
    } else {
      showEcharts.value = true;
      const { xaxis: xAxisData, yaxis } = responseData;
      if (xAxisData.length === 0 || (subSys.value?.type === 0 && yaxis.length === 0)) {
        showEcharts.value = false;
        description.value = 'No data';
      } else {
        // 将x轴的数据从电站时区转成零时区
        const utcXAxisData = covertXData(xAxisData, props.timezone);
        const yAxisData = subSys.value?.type ? yaxis : covertData(yaxis);
        if (timely) {
          subSys.value?.type
            ? setOptions(getNewHeaterOptions(utcXAxisData, yAxisData), false)
            : setOptions(getNewEchartsOptions(utcXAxisData, yAxisData, normalization.value), false);
        } else {
          subSys.value?.type
            ? setOptions(getHeaterOptions(timeDimension.value, utcXAxisData, yAxisData))
            : setOptions(
                getEchartsOptions(
                  timeDimension.value,
                  utcXAxisData,
                  yAxisData,
                  normalization.value,
                ),
              );
        }
      }
    }
  };

  // 获取热水器的时序数据
  const { run: getHeaterIntervalData, cancel: cancelHeaterIntervalData } = useRequest(
    getHeaterChartsInfo,
    {
      pollingInterval: pollingInterval,
      onSuccess: ({ data: responseData, msg }) => handleData(responseData, msg, true),
    },
  );
  const { run: getHeaterData } = useRequest(getHeaterChartsInfo, {
    onSuccess: ({ data: responseData, msg }) => handleData(responseData, msg, false),
  });

  // 获取电池的时序数据
  const { run, cancel: cancelChartsInfo } = useRequest(searchChartsInfo, {
    pollingInterval: pollingInterval,
    onSuccess: ({ data: responseData, msg }) => handleData(responseData, msg, true),
  });
  const { run: getData } = useRequest(searchChartsInfo, {
    onSuccess: ({ data: responseData, msg }) => handleData(responseData, msg, false),
  });

  const showTimely = computed(
    () =>
      (unref(timeDimension) === 'date' &&
        formatToDate(dateValue.value) === dayjs().format('YYYY-MM-DD')) ||
      (unref(timeDimension) === 'month' &&
        formatToMonth(dateValue.value) === dayjs().format('YYYY-MM')) ||
      (unref(timeDimension) === 'hour' &&
        formatToHour(dateValue.value) === dayjs().format('MM-DD HH')),
  );

  const timeOuter = ref();
  const getStatisticsData = () => {
    timeOuter.value && clearTimeout(timeOuter.value);
    let params: any = {};
    if (subSys.value && subSys.value.type) {
      // 热水器时序图
      params = {
        timeDimension: timeDimension.value,
        timestamp: dayjs(dateValue.value).tz(props.timezone, true).valueOf(),
        subSysId: subSysId.value,
        heaterType: 'L1',
        offset: 480,
      };
      //console.log(params)
      getHeaterData(params);
    } else {
      // 电池时序图
      params = {
        timeDimension: timeDimension.value,
        timestamp: dayjs(dateValue.value).tz(props.timezone, true).valueOf(),
        batId: subSysId.value,
        offset: 480,
      };
      getData(params);
    }
    timeOuter.value = setTimeout(() => {
      if (unref(showTimely)) {
        subSys.value && subSys.value.type ? getHeaterIntervalData(params) : run(params);
      }
    }, 4000);
  };

  watch([timeDimension, dateValue, subSysId], () => {
    cancelHeaterIntervalData();
    cancelChartsInfo();
    getStatisticsData();
  });

  // 图表数据处理 end==========================================================================
</script>

<style lang="less" scoped>
  .overview-power-chart {
    margin-top: 1rem;
    height: 450px;
    display: flex;
    flex-direction: column;
    padding: 0 20px;

    border-radius: 20px;
    border: 2px solid rgba(0, 0, 0, 0.04);
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(30px);
  }
  .power-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }
  .power-overview {
    flex: auto;
  }
</style>
