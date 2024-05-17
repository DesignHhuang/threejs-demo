<template>
  <BasicModal @register="register" :footer="null" :width="1000" @cancel="handelCancel">
    <div class="mode-setting">
      <div class="w-1/2">
        <div class="select-mode">
          <div v-if="modeSelect === 'ems'" class="mode-img">
            <svg width="100" height="87" class="motion-ems">
              <path
                d="M1.5791 2.44971L1.57914 32.869C1.57918 60.4832 23.9649 82.8689 51.5792 82.8689L91.8929 82.8689"
                stroke="#00A3FF"
                stroke-width="3"
                stroke-linecap="round"
                stroke-dasharray="0.1 5"
                fill="none"
              />
            </svg>
            <img class="ems-img" :src="ems" alt="ems" width="180" />
            <div class="mate-img">
              <img :src="mate" alt="image" width="300" />
              <img :src="green" alt="green" class="mode-green-1" :class="light1Status" />
              <img :src="green" alt="green" class="mode-green-2" :class="light2Status" />
              <img :src="green" alt="green" class="mode-green-3" :class="light3Status" />
              <img :src="green" alt="green" class="mode-green-4" :class="light4Status" />
              <img :src="red" alt="red" class="mode-red-5" :class="light5Status" />
            </div>
          </div>
          <div v-if="modeSelect === 'meter'" class="mode-img">
            <svg width="100" height="87" class="motion-meter">
              <path
                d="M1.5791 2.44971L1.57914 32.869C1.57918 60.4832 23.9649 82.8689 51.5792 82.8689L91.8929 82.8689"
                stroke="#00A3FF"
                stroke-width="3"
                stroke-linecap="round"
                stroke-dasharray="0.1 5"
                fill="none"
              />
            </svg>
            <img class="meter-img" :src="meter" alt="meter" width="100" />
            <div class="mate-img">
              <img :src="mate" alt="image" width="300" />
              <img :src="green" alt="green" class="mode-green-1" :class="light1Status" />
              <img :src="green" alt="green" class="mode-green-2" :class="light2Status" />
              <img :src="green" alt="green" class="mode-green-3" :class="light3Status" />
              <img :src="green" alt="green" class="mode-green-4" :class="light4Status" />
              <img :src="red" alt="red" class="mode-red-5" :class="light5Status" />
            </div>
          </div>
          <div v-if="modeSelect === 'inverter'" class="mode-img">
            <svg width="100" height="87" class="motion-inverter">
              <path
                d="M1.5791 2.44971L1.57914 32.869C1.57918 60.4832 23.9649 82.8689 51.5792 82.8689L91.8929 82.8689"
                stroke="#00A3FF"
                stroke-width="3"
                stroke-linecap="round"
                stroke-dasharray="0.1 5"
                fill="none"
              />
            </svg>
            <img class="inverter-img" :src="inverter" alt="inverter" width="260" />
            <div class="mate-img">
              <img :src="mate" alt="image" width="300" />
              <img :src="green" alt="green" class="mode-green-1" :class="light1Status" />
              <img :src="green" alt="green" class="mode-green-2" :class="light2Status" />
              <img :src="green" alt="green" class="mode-green-3" :class="light3Status" />
              <img :src="green" alt="green" class="mode-green-4" :class="light4Status" />
              <img :src="red" alt="red" class="mode-red-5" :class="light5Status" />
            </div>
          </div>

          <a-select v-model:value="modeSelect" style="width: 200px">
            <a-select-option value="ems" :disabled="!emsMode">EMS Mode</a-select-option>
            <a-select-option value="inverter" :disabled="!inverterMode">
              Inverter Mode
            </a-select-option>
            <a-select-option value="meter" :disabled="!meterMode">Meter Mode</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="w-1/2" style="position: relative">
        <div class="mode-title"> WattMate Settings </div>
        <template v-if="modeSelect === 'ems'">
          <div class="mode-desc">
            note: in the ems mode, all the settings of Wattmate are under control of ems system.
          </div>
          <div class="mode-desc mt-12 mb-2 ml-4"> Device settings </div>
          <div class="setting-content">
            <div class="setting-item">
              <span class="item-key">Target temperature</span>
              <div class="flex items-center">
                <span class="item-value">{{ emsModeData_temp }}</span>
                <span>℃</span>
              </div>
            </div>
            <div class="setting-item">
              <span class="item-key">Maximum power limit</span>
              <div class="flex items-center">
                <span class="item-value">{{ emsModeData_power }}</span>
                <span>W</span>
              </div>
            </div>
            <div class="setting-item">
              <span class="item-key">Time Zone</span>
              <span class="item-value-timezone">{{ settingTimeZone }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="mode-desc mt-12 mb-2 ml-4"> BY SOLAR </div>
          <div class="setting-content">
            <div class="setting-item">
              <span class="item-key">Maximum temperature</span>
              <div class="flex items-center">
                <InputNumber
                  v-model:value="maxTemp"
                  style="margin-right: 10px"
                  placeholder="0-100"
                  :precision="0"
                  :min="0"
                  :max="100"
                />
                <span>℃</span>
              </div>
            </div>
          </div>
          <div class="mode-desc mt-12 mb-2 ml-4"> minimum temperture guarantee </div>
          <div class="setting-content">
            <div class="setting-item">
              <span class="item-key">Time Setting</span>
              <div class="flex items-center">
                <div class="time-con">
                  <div
                    class="time-select"
                    :class="{ 'time-actived': timeMode === 'day' }"
                    @click="timeMode = 'day'"
                  >
                    All day
                  </div>
                  <div
                    class="time-select"
                    :class="{ 'time-actived': timeMode === 'time' }"
                    @click="timeMode = 'time'"
                  >
                    By time
                  </div>
                </div>
              </div>
            </div>
            <div class="setting-item">
              <span class="item-key">Time Zone</span>
              <span class="item-value-timezone">{{ settingTimeZone }}</span>
            </div>
            <div class="setting-item">
              <span class="item-key">Power Limit</span>
              <div class="flex items-center">
                <InputNumber
                  v-model:value="maxGridPower"
                  style="margin-right: 10px"
                  placeholder="0-9000"
                  :precision="0"
                  :min="0"
                  :max="9000"
                />
                <span>W</span>
              </div>
            </div>
            <template v-if="timeMode === 'day'">
              <div class="setting-item">
                <span class="item-key">Minimum Temperature</span>
                <div class="flex items-center">
                  <InputNumber
                    v-model:value="allDayTargetTemp"
                    style="margin-right: 10px"
                    placeholder="0-100"
                    :precision="0"
                    :min="0"
                    :max="100"
                  />
                  <span>℃</span>
                </div>
              </div>
            </template>
            <template v-if="timeMode === 'time'">
              <div class="setting-item" v-for="(timeRange, index) in timeRanges">
                <span class="item-key flex items-center">
                  <div class="add delete" @click="deleteTimeRange(index)">
                    <Icon icon="ic:round-minus" :size="1" />
                  </div>
                  <span class="mr-2 ml-3">From</span>
                  <TimePicker
                    v-model:value="timeRange.start"
                    placeholder="Start"
                    style="margin-right: 10px"
                    format="HH:mm"
                  >
                    <template #suffixIcon></template>
                  </TimePicker>
                  <span class="mr-2">to</span>
                  <TimePicker
                    v-model:value="timeRange.end"
                    placeholder="End"
                    style="margin-right: 10px"
                    format="HH:mm"
                  >
                    <template #suffixIcon></template>
                  </TimePicker>
                </span>
                <div class="flex items-center">
                  <InputNumber
                    v-model:value="timeRange.value"
                    style="margin-right: 10px"
                    placeholder="0-100"
                    :precision="0"
                    :min="0"
                    :max="100"
                  />
                  <span>℃</span>
                </div>
              </div>
              <div v-if="showAdd" class="setting-item">
                <div class="add" @click="addTimeRange">
                  <Icon icon="add_grey|svg" :size="1" style="color: #818792" />
                </div>
              </div>
            </template>
          </div>
          <div class="mode-desc-bottom mt-2 ml-4">
            To reach minimum temperature, WattMate may need to use certain amount of grid power to
            heating water according to Maximum Power Limit and target temperature set above.
          </div>
        </template>
      </div>
    </div>
    <div class="modal-footer-old w-1/2" style="float: right">
      <a-button class="modal-cancel mr-5" @click="handelCancel">Cancel</a-button>
      <a-button class="modal-save ml-5" @click="saveSetting" :loading="loading">Save</a-button>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, inject, ref, unref, watchEffect } from 'vue';
  import { InputNumber, TimePicker } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import Icon from '@/components/Icon/Icon.vue';
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';
  import { intersection, remove, some } from 'lodash-es';
  import mate from '@/assets/svg/WattMate.svg';
  import ems from '@/assets/svg/ems.svg';
  import inverter from '@/assets/svg/Inverter.svg';
  import meter from '@/assets/svg/Meter.svg';
  import { useRequest } from 'vue-request';
  import { setWattmate } from '/@/api/wattspace/powerStation';
  import { useMessage } from '/@/hooks/web/useMessage';
  /* import { getDictionary } from '/@/api/wattspace/system'; */
  import green from '@/assets/svg/MateGreen.svg';
  import red from '@/assets/svg/MateRed.svg';
  import { getStatusClass } from '/@/utils/helper/mateHelper';

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const emit = defineEmits(['register', 'run']);
  const wattMateData = inject('WattMateData') as any;

  const modeSelect = ref();

  const { createMessage } = useMessage();
  const [register, { redoModalHeight, closeModal }] = useModalInner((data) => {
    modeSelect.value = data.mode;
  });

  const emsMode = computed(() => wattMateData.value.supportModeList.includes(0));
  const meterMode = computed(() => wattMateData.value.supportModeList.includes(1));
  const inverterMode = computed(() => wattMateData.value.supportModeList.includes(2));
  const timeMode = ref('day');
  const maxTemp = ref();
  const allDayTargetTemp = ref();
  const maxGridPower = ref();
  const timeRanges = ref<any[]>([
    {
      start: null,
      end: null,
      value: null,
    },
  ]);

  const emsModeData_temp = computed(() => wattMateData.value.emsMaxTemp);
  const emsModeData_power = computed(() => wattMateData.value.maxPower);

  let settingTimeZone = ref();

  const showAdd = computed(() => timeRanges.value.length < 5);

  const addTimeRange = () => {
    if (showAdd.value) {
      timeRanges.value.push({
        start: null,
        end: null,
        value: null,
      });
      redoModalHeight();
    }
  };

  const deleteTimeRange = (index: number) => {
    if (timeRanges.value.length > 1) {
      remove(timeRanges.value, (_, i) => {
        return i === index;
      });
      redoModalHeight();
    }
  };

  const saveSetting = () => {
    const subSysId = wattMateData.value.subSysVo.subSysId;
    if (modeSelect.value === 'ems') {
      run({ subSysId, workMode: 0, zoneId: settingTimeZone });
    } else {
      let sendData = {
        subSysId,
        workMode: modeSelect.value === 'meter' ? 1 : 2,
        zoneId: settingTimeZone,
        maxTemp: maxTemp.value,
        timeMode: timeMode.value === 'day' ? 0 : 1,
        allDayTargetTemp: allDayTargetTemp.value,
        maxGridPower: maxGridPower.value,
      };
      if (timeMode.value === 'time') {
        const planlistArr = timeRanges.value.map((res) => {
          if (!res.start || !res.end || res.value === null) {
            return 'error';
          }
          const start = Math.round(Number(res.start.format('H.mm')) * 100);
          const end = Math.round(Number(res.end.format('H.mm')) * 100);
          const times = end - start;
          if (times < 1) {
            return 'error';
          }
          const timeRangeData: number[] = [];
          for (let i = 0; i < times; i++) {
            timeRangeData.push(start + i);
          }
          return timeRangeData;
        });
        if (planlistArr.includes('error')) {
          createMessage.error('Please check the setup parameters');
          return false;
        } else {
          const intersect0 = intersection(planlistArr[0] as number[], planlistArr[1] as number[]);
          const intersect1 = intersection(planlistArr[0] as number[], planlistArr[2] as number[]);
          const intersect2 = intersection(planlistArr[0] as number[], planlistArr[3] as number[]);
          const intersect3 = intersection(planlistArr[0] as number[], planlistArr[4] as number[]);
          const intersect4 = intersection(planlistArr[1] as number[], planlistArr[2] as number[]);
          const intersect5 = intersection(planlistArr[1] as number[], planlistArr[3] as number[]);
          const intersect6 = intersection(planlistArr[1] as number[], planlistArr[4] as number[]);
          const intersect7 = intersection(planlistArr[2] as number[], planlistArr[3] as number[]);
          const intersect8 = intersection(planlistArr[2] as number[], planlistArr[4] as number[]);
          const intersect9 = intersection(planlistArr[3] as number[], planlistArr[4] as number[]);
          const intersect = [
            intersect0,
            intersect1,
            intersect2,
            intersect3,
            intersect4,
            intersect5,
            intersect6,
            intersect7,
            intersect8,
            intersect9,
          ];
          const isTimeIntersection = some(intersect, (res) => res.length > 0);
          if (isTimeIntersection) {
            createMessage.error('Please check the setup parameters');
            return;
          }
        }
        if (sendData.maxTemp == null || sendData.maxGridPower == null) {
          createMessage.error('Please check the setup parameters');
          return;
        }
        run({
          ...sendData,
          planList: timeRanges.value.map((res) => ({
            startTime: res.start.format('HH:mm'),
            endTime: res.end.format('HH:mm'),
            targetTemp: res.value,
          })),
        });
      } else {
        if (
          sendData.maxTemp == null ||
          sendData.allDayTargetTemp == null ||
          sendData.maxGridPower == null
        ) {
          createMessage.error('Please check the setup parameters');
          return;
        }
        run(sendData);
      }
    }
  };

  const { run, loading } = useRequest(setWattmate, {
    onSuccess: (data) => {
      if (data) {
        closeModal();
        emit('run');
        createMessage.success('Success Saved ');
      }
    },
  });

  /* const { data: options } = useRequest(getDictionary, {
    manual: false,
    defaultParams: ['TIME ZONE'],
  }); */

  const light1Status = computed(() => {
    if (wattMateData.value) {
      return getStatusClass(wattMateData.value?.light1Status);
    } else {
      return 0;
    }
  });
  const light2Status = computed(() => {
    if (wattMateData.value) {
      return getStatusClass(wattMateData.value?.light2Status);
    } else {
      return 0;
    }
  });
  const light3Status = computed(() => {
    if (wattMateData.value) {
      return getStatusClass(wattMateData.value?.light3Status);
    } else {
      return 0;
    }
  });
  const light4Status = computed(() => {
    if (wattMateData.value) {
      return getStatusClass(wattMateData.value?.light4Status);
    } else {
      return 6;
    }
  });
  const light5Status = computed(() => {
    if (wattMateData.value) {
      return getStatusClass(wattMateData.value?.light5Status);
    } else {
      return 8;
    }
  });

  watchEffect(() => {
    if (unref(wattMateData)) {
      maxTemp.value = unref(wattMateData).maxTemp;
      allDayTargetTemp.value = unref(wattMateData).allDayTargetTemp;
      maxGridPower.value = unref(wattMateData).maxGridPower;
      settingTimeZone.value = unref(wattMateData).zoneId;
      // 0: All Day 1: By Time
      timeMode.value = unref(wattMateData).timeMode ? 'time' : 'day';
      if (unref(wattMateData).wattMatePlanVoList.length === 0) {
        timeRanges.value = [
          {
            start: null,
            end: null,
            value: null,
          },
        ];
      } else {
        timeRanges.value = unref(wattMateData).wattMatePlanVoList.map((res) => ({
          start: dayjs(res.startTime, 'HH:mm'),
          end: dayjs(res.endTime, 'HH:mm'),
          value: res.targetTemp,
        }));
      }
    }
  });

  const handelCancel = () => {
    closeModal();
    emit('run');
  };
</script>

<style lang="less">
  .mode-setting {
    display: flex;

    .ant-input,
    .ant-input-number,
    .ant-picker {
      background: #e2e4ea;
      border-radius: 6px;
    }

    .ant-input-number:focus,
    .ant-input-number-focused,
    .ant-picker-focused {
      box-shadow: unset;
    }

    .ant-input-number,
    .ant-picker {
      border: 0;
    }

    .ant-input-number .ant-input-number-input {
      text-align: center;
      color: #22272c;
      font-weight: 600;
      height: 30px;
    }
    .ant-select .ant-select-selection-item {
      color: #22272c;
      font-weight: 600;
    }

    .ant-picker .ant-picker-input > input {
      text-align: center;
      color: #22272c;
      font-weight: 600;
    }

    .motion-ems {
      position: absolute;
      top: 240px;
      left: 60px;
      animation: spin 3s linear infinite;
      z-index: 0;
    }
    .motion-meter {
      position: absolute;
      top: 260px;
      left: 40px;
      animation: spin 3s linear infinite;
      z-index: 0;
    }

    .motion-inverter {
      position: absolute;
      top: 230px;
      left: 60px;
      animation: spin 3s linear infinite;
      z-index: 0;
    }

    @keyframes spin {
      to {
        stroke-dashoffset: -100;
      }
    }

    .arr1 {
      offset-path: path(
        'M1.5791 2.44971L1.57914 32.869C1.57918 60.4832 23.9649 82.8689 51.5792 82.8689L91.8929 82.8689'
      );
    }

    .select-mode {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .mode-title {
      color: #2c2d30;
      font-size: 30px;
      font-weight: 600;
    }

    .mode-img {
      position: relative;
      width: 100%;
      height: 450px;

      .ems-img {
        position: absolute;
        margin-top: 100px;
        z-index: 1;
      }
      .meter-img {
        position: absolute;
        margin-top: 160px;
        z-index: 1;
      }
      .inverter-img {
        position: absolute;
        margin-top: 80px;
        z-index: 1;
      }
      .mate-img {
        position: absolute;
        width: 300px;
        top: 150px;
        left: 120px;
        z-index: 2;
        .mode-green-1 {
          position: absolute;
          width: 24px;
          top: 110px;
          left: 24px;
        }

        .mode-green-2 {
          position: absolute;
          width: 24px;
          top: 110px;
          left: 56px;
        }
        .mode-green-3 {
          position: absolute;
          width: 24px;
          top: 110px;
          left: 88px;
        }
        .mode-green-4 {
          position: absolute;
          width: 24px;
          top: 110px;
          left: 120px;
        }
        .mode-red-5 {
          position: absolute;
          width: 24px;
          top: 110px;
          left: 152px;
        }
      }
    }
    .mode-desc {
      color: rgba(44, 45, 48, 0.5);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .select-timezone {
      min-width: 160px;
      border-radius: 5px;
      background: #eaecf0;
    }
    .setting-content {
      border-radius: 10px;
      background: #fff;
      padding-left: 24px;

      .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 24px;
        height: 50px;

        &:not(:last-child) {
          border-bottom: 2px solid #ebecf1;
        }
        .add {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #e2e4ea;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .delete {
          color: #818792;
          &:hover {
            color: #fff;
            background: #f23b23;
          }
        }

        .item-key {
          color: #2c2d30;
          font-size: 16px;
          font-weight: 500;
        }

        .item-value {
          color: #999;
          border-radius: 5px;
          background: #eaecf0;
          height: 32px;
          width: 86px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          margin-right: 10px;
        }
        .item-value-timezone {
          border-radius: 5px;
          color: #999;
          background: #eaecf0;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          padding: 0 12px;
        }
        .time-con {
          display: flex;
          align-items: center;
          border-radius: 5px;
          background: #eaecf0;
          height: 32px;
        }
        .time-select {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 25px;
          width: 65px;
          border-radius: 3px;
          margin: 3px;
          color: #000;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .time-actived {
          background: #077deb;
          color: #fff;
        }
      }
    }

    .mode-desc-bottom {
      color: rgba(44, 45, 48, 0.5);
      font-size: 12px;
      font-weight: 500;
    }
  }
</style>
