import { max, min } from 'lodash-es';
import { useUserStore } from '/@/store/modules/user';
import { formatToDateTime } from '/@/utils/dateUtil';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const userStore = useUserStore();

export interface YAxisProps {
  voltage?: any[];
  current?: any[];
  soc?: any[];
  soh?: any[];
  maxVoltage?: any[];
  minVoltage?: any[];
  maxTemperature?: any[];
  minTemperature?: any[];
  [key: string]: any;
}

export function calPercent(diffSeconds: number /* , callback: Fn */) {
  let resultSecond: number;
  if (diffSeconds <= 120) {
    resultSecond = 0.66 * diffSeconds;
  } else if (120 < diffSeconds && diffSeconds <= 300) {
    resultSecond = 100 - 2400 / diffSeconds;
  } else {
    // 后端有五分钟兜底
    resultSecond = 100 - 2400 / diffSeconds;
    //callback();
  }
  return Math.floor(resultSecond * 100) / 100;
}

const withDeviceNo = (idstr: string, array: any[], deviceArr: any[]) => {
  return array.map((res, index) =>
    res !== null ? { id: idstr, value: res, deviceNo: deviceArr[index] } : null,
  );
};

export const covertXData = (xaxis: any[], timezone: string) => {
  // 只改变时区，不改变时间
  return xaxis.map((res) => dayjs.tz(res, timezone).utc(true).valueOf());
};

// 处理后端返回的数据 将Y轴数组数据转成对象数据进行处理
export const covertData = (yaxis: any[]) => {
  let resData: { [key: string]: any } = {};
  yaxis.forEach((element) => {
    resData = { ...resData, ...element };
  });
  resData.maxVoltage = withDeviceNo('maxVoltage', resData.maxVoltage, resData.maxVoltageDeviceNo);
  resData.minVoltage = withDeviceNo('minVoltage', resData.minVoltage, resData.minVoltageDeviceNo);
  resData.maxTemperature = withDeviceNo(
    'maxTemperature',
    resData.maxTemperature,
    resData.maxTemperatureDeviceNo,
  );
  resData.minTemperature = withDeviceNo(
    'minTemperature',
    resData.minTemperature,
    resData.minTemperatureDeviceNo,
  );
  return resData;
};

// 根据 seriesName 获取单位
const getUnit = (seriesName: string) => {
  const arr = [
    { name: 'SOC(%)', unit: '%' },
    { name: 'Max. Charge Current Limit(A)', unit: 'A' },
    { name: 'Max. Discharge Current Limit(A)', unit: 'A' },
    { name: 'Max. Cell Voltage(V)(ID)', unit: 'V' },
    { name: 'Min. Cell Voltage(V)(ID)', unit: 'V' },
    { name: 'SOH(%)', unit: '%' },
    { name: 'Current(A)', unit: 'A' },
    { name: 'Voltage(V)', unit: 'V' },
    { name: 'Max. Temp.(℃)(ID)', unit: '℃' },
    { name: 'Min. Temp.(℃)(ID)', unit: '℃' },
    { name: 'Total Charged(kWh)', unit: 'kWh' },
    { name: 'Total Discharged(kWh)', unit: 'kWh' },

    { name: 'Heating Power(W)', unit: 'W' },
    { name: 'Min. Target Temp.(℃)', unit: '℃' },
    { name: 'Max. Target Temp.(℃)', unit: '℃' },
    { name: 'Heating Temp.(℃)', unit: '℃' },
  ];
  return arr.find((res) => res.name === seriesName)?.unit || '';
};

// 自定义显示tooltip
export const ormatterTip = (params) => {
  let tipArray: string[] = [],
    tip = '',
    timeDetail = '';
  params.map((param) => {
    let dataValue: any = '';
    // console.log(param)
    const { color, seriesName, data, axisValueLabel } = param;
    dataValue = data[2];
    if (dataValue === null) return;
    timeDetail = `<div class='tooltip-title'>${axisValueLabel}</div>`;
    let icon = `<div class='tooltip-echart'><div class='tooltip-name'><span class='tooltip-icon' style='background: ${color}'></span>`;
    if (
      param.data[2]?.id &&
      ['maxVoltage', 'minVoltage', 'maxTemperature', 'minTemperature'].includes(param.data[2].id)
    ) {
      const { value, deviceNo } = param.data[2];
      const unit = ['maxVoltage', 'minVoltage'].includes(param.data[2].id) ? 'V' : '℃';
      dataValue = `${value}${unit}(${deviceNo})`;
    } else {
      dataValue = data[2] + getUnit(seriesName);
    }
    tipArray.push(
      `${icon} <span class='seriesName'>${
        seriesName.split('(')[0]
      }</span></div> <span class='dataValue'> ${dataValue}</span></div>`,
    );
  });
  tipArray.map((e) => {
    if (e) {
      tip = tip + e;
    }
  });
  tip = timeDetail + tip;
  return tip;
};

// 折线图坐标点   正常模式下的数据
const initPointData = (xData, yData, isObj = false) => {
  return yData.map((res, index) => {
    if (res === null) {
      return [formatToDateTime(xData[index]), res?.value, res];
      //return [xData[index], res?.value, res];
    } else {
      // 通过比例来算出它的位置，例如：3600, 500 + (3600 - 500) / 35 = 120，
      return isObj
        ? [
            formatToDateTime(xData[index]),
            res?.value <= 500 ? res?.value : 500 + (res?.value - 500) / 35,
            res,
          ]
        : [formatToDateTime(xData[index]), res <= 500 ? res : 500 + (res - 500) / 35, res];
    }
  });
};

// 数据归一化
const toData = (data, minValue: number, ratio: number, base: number) => {
  if (data === null) return data;
  return (data - minValue) * ratio + base;
};

// 折线图坐标点  数据归一化处理  base:其实基数，显示范围在base与base+60之间
const normalizeData = (xData, yData, base: number, isObj = false) => {
  //const base  // 基数 0-80

  // 获取y轴数据中的最大值/最小值
  const maxValue = isObj ? max(yData.map((res) => res?.value)) : max(yData);
  const minValue = isObj ? min(yData.map((res) => res?.value)) : min(yData);
  if (!maxValue || minValue === undefined) {
    return yData.map((res, index) =>
      isObj ? [xData[index], res?.value, res] : [xData[index], res, res],
    );
  } else {
    const diff = (maxValue as number) - (minValue as number);
    // console.log(diff)
    if (diff === 0) {
      const baseLine = (maxValue as number) < 100 ? maxValue : 100;
      return yData.map((res, index) =>
        isObj
          ? [xData[index], res?.value ? baseLine : res?.value, res]
          : [xData[index], res ? baseLine : res, res],
      );
    }
    // 求出放大缩小比例 按照5-65,10-70...40-100回归
    const ratio = 35 / diff;
    return yData.map((res, index) => {
      if (res === null) {
        return [xData[index], res?.value, res];
      } else {
        const value = isObj
          ? toData(res?.value, minValue as number, ratio, base)
          : toData(res, minValue as number, ratio, base);
        return [xData[index], value, res];
      }
    });
  }
};

export const getNewEchartsOptions: any = (
  xAxisData,
  yAxisData: YAxisProps,
  normalization: boolean,
) => ({
  series: [
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.soc, 65)
        : initPointData(xAxisData, yAxisData.soc),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.chargeCurrentLimit, 70)
        : initPointData(xAxisData, yAxisData.chargeCurrentLimit),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.dischargeCurrentLimit, 55)
        : initPointData(xAxisData, yAxisData.dischargeCurrentLimit),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.maxVoltage, 30, true)
        : initPointData(xAxisData, yAxisData.maxVoltage, true),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.minVoltage, 25, true)
        : initPointData(xAxisData, yAxisData.minVoltage, true),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.soh, 60)
        : initPointData(xAxisData, yAxisData.soh),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.current, 40)
        : initPointData(xAxisData, yAxisData.current),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.voltage, 35)
        : initPointData(xAxisData, yAxisData.voltage),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.maxTemperature, 50, true)
        : initPointData(xAxisData, yAxisData.maxTemperature, true),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.minTemperature, 45, true)
        : initPointData(xAxisData, yAxisData.minTemperature, true),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.totalCharge, 37)
        : initPointData(xAxisData, yAxisData.totalCharge),
    },
    {
      data: normalization
        ? normalizeData(xAxisData, yAxisData.totalDischarge, 32)
        : initPointData(xAxisData, yAxisData.totalDischarge),
    },
  ],
});

export const getNewHeaterOptions: any = (xAxisData, yAxisData: YAxisProps) => ({
  series: [
    {
      data: initPointData(xAxisData, yAxisData.currentPower),
    },
    {
      data: initPointData(xAxisData, yAxisData.targetTemp),
    },
    {
      data: initPointData(xAxisData, yAxisData.maxTemp),
    },
    {
      data: initPointData(xAxisData, yAxisData.currentTemp),
    },
  ],
});

export const getEchartsOptions: any = (
  dimension: string,
  xAxisData,
  yAxisData: YAxisProps,
  normalization: boolean,
) => {
  let /* formatter,  */ splitNumber;
  switch (dimension) {
    case 'hour':
      //formatter = '{HH}:{mm}';
      splitNumber = 60;
      break;
    case 'date':
      //formatter = '{HH}:{mm}';
      splitNumber = 22;
      break;
    case 'month':
      //formatter = '{M}-{d}';
      splitNumber = 31;
      break;
    case 'year':
      //formatter = '{M}'
      splitNumber = 12;
      break;
  }

  const yConfigs = [
    {
      show: false,
      alignTicks: true,
      scale: true,
      type: 'value',
      interval: 20,
      max: 100,
      min: 0,
      splitNumber: 5,
      /* axisTick: {
      show: false,
    }, */
      axisLabel: {
        show: false,
      },
      /* splitArea: {
      show: true,
      areaStyle: {
        color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)'],
      },
    }, */
    },
    {
      alignTicks: true,
      scale: true,
      type: 'value',
      minInterval: 1,
      //min: 0,
      //interval: 20,
      // max: 140,  // y轴最大值不能超过7100 ，如果超过需要再做处理
      axisLabel: {
        formatter: function (value, index) {
          //Y轴的自定义刻度值
          //100以上的数据 一个刻度代表175
          return value > 500 ? 500 + 35 * (value - 500) : value;
        },
      },
      minorSplitLine: {
        show: true,
      },
      /* splitArea: {
      show: true,
      areaStyle: {
        color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)'],
      },
    }, */
    },
  ];

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          width: 1,
          color: '#077DEB',
        },
      },
      className: 'echarts-tooltip',
      formatter: (params) => ormatterTip(params),
    },
    useUTC: true,
    legend: {
      icon: 'roundRect',
      orient: 'vertical',
      left: 'left',
      //top: 'middle',
      selected: userStore.getLegendselectState,
    },
    //useUTC: true,
    xAxis: {
      type: 'time',
      //boundaryGap: false,
      //data: xAxisData.map(res => formatToDateTime(res)),
      axisLabel: {
        //rotate: 45,
        /* formatter: function (value, index) {
          //return formatToTZ(value);
          return formatToDateTime(value);
        }, */
        hideOverlap: true,
      },
      minInterval: 5 * 1000,
      splitNumber: splitNumber,
    },
    yAxis: normalization ? [yConfigs[0]] : [yConfigs[1]],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        start: 0,
        end: 100,
      },
    ],
    grid: { left: 250, right: '1%', top: '2%' },
    color: [
      '#00E4FF',
      '#0396FF',
      '#32CCBC',
      '#28C76F',
      '#C32BAC',
      '#CA26FF',
      '#FF52E5',
      '#F8D800',
      '#FA742B',
      '#7367F0',
      '#FD6585',
      '#8C1BAB',
    ],
    series: [
      {
        smooth: true, //  SOC (%) soc
        data: normalization
          ? normalizeData(xAxisData, yAxisData.soc, 65)
          : initPointData(xAxisData, yAxisData.soc),
        type: 'line',
        showSymbol: false,
        name: 'SOC(%)',
      },
      {
        smooth: true, //Charge Current Limit (A)
        data: normalization
          ? normalizeData(xAxisData, yAxisData.chargeCurrentLimit, 70)
          : initPointData(xAxisData, yAxisData.chargeCurrentLimit),
        type: 'line',
        showSymbol: false,
        name: 'Max. Charge Current Limit(A)',
      },
      {
        smooth: true, //Discharge Current Limit (A)
        data: normalization
          ? normalizeData(xAxisData, yAxisData.dischargeCurrentLimit, 55)
          : initPointData(xAxisData, yAxisData.dischargeCurrentLimit),
        type: 'line',
        showSymbol: false,
        name: 'Max. Discharge Current Limit(A)',
      },
      {
        smooth: true, //Max. Cell Voltage(V)(ID) maxVoltage
        data: normalization
          ? normalizeData(xAxisData, yAxisData.maxVoltage, 30, true)
          : initPointData(xAxisData, yAxisData.maxVoltage, true),
        type: 'line',
        showSymbol: false,
        name: 'Max. Cell Voltage(V)(ID)',
      },
      {
        smooth: true, //Min. Cell Voltage(V)(ID)
        data: normalization
          ? normalizeData(xAxisData, yAxisData.minVoltage, 25, true)
          : initPointData(xAxisData, yAxisData.minVoltage, true),
        type: 'line',
        showSymbol: false,
        name: 'Min. Cell Voltage(V)(ID)',
      },
      {
        smooth: true, //  SOH (%) soh
        data: normalization
          ? normalizeData(xAxisData, yAxisData.soh, 60)
          : initPointData(xAxisData, yAxisData.soh),
        type: 'line',
        showSymbol: false,
        name: 'SOH(%)',
      },
      {
        smooth: true, //  Current (A) current
        data: normalization
          ? normalizeData(xAxisData, yAxisData.current, 40)
          : initPointData(xAxisData, yAxisData.current),
        type: 'line',
        showSymbol: false,
        name: 'Current(A)',
      },
      {
        smooth: true, //Voltage (V)    voltage
        data: normalization
          ? normalizeData(xAxisData, yAxisData.voltage, 35)
          : initPointData(xAxisData, yAxisData.voltage),
        type: 'line',
        showSymbol: false,
        name: 'Voltage(V)',
      },
      {
        smooth: true, //Max. Temp.(℃)(ID)
        data: normalization
          ? normalizeData(xAxisData, yAxisData.maxTemperature, 50, true)
          : initPointData(xAxisData, yAxisData.maxTemperature, true),
        type: 'line',
        showSymbol: false,
        name: 'Max. Temp.(℃)(ID)',
      },
      {
        smooth: true, //Min. Temp.(℃)(ID)
        data: normalization
          ? normalizeData(xAxisData, yAxisData.minTemperature, 45, true)
          : initPointData(xAxisData, yAxisData.minTemperature, true),
        type: 'line',
        showSymbol: false,
        name: 'Min. Temp.(℃)(ID)',
      },
      {
        smooth: true, //Total Charged (kWh)
        data: normalization
          ? normalizeData(xAxisData, yAxisData.totalCharge, 37)
          : initPointData(xAxisData, yAxisData.totalCharge),
        type: 'line',
        showSymbol: false,
        name: 'Total Charged(kWh)',
      },
      {
        smooth: true, //  Total Discharged (kWh)
        data: normalization
          ? normalizeData(xAxisData, yAxisData.totalDischarge, 32)
          : initPointData(xAxisData, yAxisData.totalDischarge),
        type: 'line',
        showSymbol: false,
        name: 'Total Discharged(kWh)',
      },
      // 测试数据，部署时代码需要注释掉
      /* {
        smooth: true, //mockdata
        data: normalization ? normalizeData(xAxisData, yAxisData.mockdata, 20) : initPointData(xAxisData, yAxisData.mockdata),
        type: 'line', showSymbol: false,
        name: '模拟的数据',
      }, */
    ],
  };
};

export const getHeaterOptions: any = (dimension: string, xAxisData, yAxisData: YAxisProps) => {
  let splitNumber;
  switch (dimension) {
    case 'hour':
      splitNumber = 60;
      break;
    case 'date':
      splitNumber = 22;
      break;
    case 'month':
      splitNumber = 31;
      break;
    case 'year':
      splitNumber = 12;
      break;
  }
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          width: 1,
          color: '#077DEB',
        },
      },
      className: 'echarts-tooltip',
      formatter: (params) => ormatterTip(params),
    },

    legend: {
      icon: 'roundRect',
      orient: 'vertical',
      left: 'left',
      selected: userStore.getLegendselectState,
    },
    useUTC: true,
    xAxis: {
      type: 'time',
      axisLabel: {
        hideOverlap: true,
      },
      minInterval: 5 * 1000,
      splitNumber: splitNumber,
    },
    yAxis: {
      alignTicks: true,
      scale: true,
      type: 'value',
      minInterval: 1,
      axisLabel: {
        formatter: function (value, index) {
          return value > 500 ? 500 + 35 * (value - 500) : value;
        },
      },
      minorSplitLine: {
        show: true,
      },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        start: 0,
        end: 100,
      },
    ],
    grid: { left: 250, right: '1%', top: '2%' },
    series: [
      {
        smooth: true, //  currentPower (W)
        data: initPointData(xAxisData, yAxisData.currentPower),
        type: 'line',
        showSymbol: false,
        name: 'Heating Power(W)',
      },
      {
        smooth: true, //targetTemp (℃)
        data: initPointData(xAxisData, yAxisData.targetTemp),
        type: 'line',
        showSymbol: false,
        name: 'Min. Target Temp.(℃)',
      },
      {
        smooth: true, //maxTemp (℃)
        data: initPointData(xAxisData, yAxisData.maxTemp),
        type: 'line',
        showSymbol: false,
        name: 'Max. Target Temp.(℃)',
      },
      {
        smooth: true, //currentTemp(℃)
        data: initPointData(xAxisData, yAxisData.currentTemp),
        type: 'line',
        showSymbol: false,
        name: 'Heating Temp.(℃)',
      },
    ],
  };
};
