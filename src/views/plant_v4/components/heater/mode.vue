<template>
  <BasicModal @register="register" :footer="null" :width="900" style="min-width: 900px">
    <div class="select-mode">
      <a-row>
        <a-col :span="12" class="devices">
          <div class="device-img">
            <img :src="mate" alt="mate" class="mode-img" />
            <img :src="green" alt="green" class="mode-green-1" :class="light1Status" />
            <img :src="green" alt="green" class="mode-green-2" :class="light2Status" />
            <img :src="green" alt="green" class="mode-green-3" :class="light3Status" />
            <img :src="green" alt="green" class="mode-green-4" :class="light4Status" />
            <img :src="red" alt="red" class="mode-red-5" :class="light5Status" />
          </div>
          <div v-if="status" class="contected flex items-center">
            <Icon icon="ion:checkmark-circle-outline" color="#0bed22" :size="1" />
            <span class="ml-2">Online</span>
          </div>
          <div v-else class="uncontected flex items-center">
            <Icon icon="ion:close-circle-outline" color="#f52424" :size="1" />
            <span class="ml-2">Offline</span>
          </div>
          <div v-if="pairingStatus !== null">
            <div v-if="pairingStatus === 0" class="flex items-center">
              <Icon icon="ion:checkmark-circle-outline" color="#0bed22" :size="1" />
              <span style="color: #0bed22" class="ml-2">success</span>
            </div>
            <div v-if="pairingStatus === 1" class="flex items-center">
              <Icon icon="svg-spinners:tadpole" color="#077deb" :size="1" />
              <span style="color: #077deb" class="ml-2"
                >WattMate is connecting to {{ modeSelect }}</span
              >
            </div>
            <div v-if="pairingStatus === -1" class="flex items-center">
              <Icon icon="ion:close-circle-outline" color="#f52424" :size="1" />
              <span style="color: #f52424" class="ml-2">unable to connect</span>
            </div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="mode-title"> WattMate setting </div>
          <div class="mode-desc"> Choose a device type the WattMate is connected to </div>
          <!-- <div class="mode-btn" @click="setMode('ems', emsMode, status)"> EMS Mode </div>
          <div class="mode-btn" @click="setMode('inverter', inverterMode, status)">
            Inverter Mode
          </div>
          <div class="mode-btn" @click="setMode('meter', meterMode, status)">
            Smart Meter Mode
          </div> -->

          <a-select v-model:value="modeSelect" @change="handleChange" style="width: 300px">
            <a-select-option value="ems">EMS Mode</a-select-option>
            <a-select-option value="inverter"> Inverter Mode </a-select-option>
            <a-select-option value="meter">Meter Mode</a-select-option>
          </a-select>
          <div style="margin-top: 20px">
            <a-button @click="pairConnect">
              {{ pairingStatus === 0 ? 'go setting' : 'Pair Connect' }}</a-button
            >
          </div>
        </a-col>
      </a-row>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, inject, ref } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import Icon from '@/components/Icon/Icon.vue';
  import mate from '@/assets/svg/WattMate.svg';
  import green from '@/assets/svg/MateGreen.svg';
  import red from '@/assets/svg/MateRed.svg';
  import { getStatusClass } from '/@/utils/helper/mateHelper';
  // import { useMessage } from '@/hooks/web/useMessage';
  import { wattmatePreConfig } from '/@/api/wattspace/powerStation';
  import type { SelectProps } from 'ant-design-vue';

  const emit = defineEmits(['register', 'toSetting']);

  const wattMateData = inject('WattMateData') as any;

  let subSysId: string;
  const [register] = useModalInner((data) => {
    subSysId = data.subSysId;
  });
  // const { createErrorModal } = useMessage();

  const status = computed(() => wattMateData.value?.comStatus);
  const emsMode = computed(() => wattMateData.value.supportModeList?.includes(0));
  const meterMode = computed(() => wattMateData.value.supportModeList?.includes(1));
  const inverterMode = computed(() => wattMateData.value.supportModeList?.includes(2));

  const modeSelect = ref('ems');
  const pairingStatus = ref<number | null>();

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

  // const setMode = (mode: string, modeType: boolean, status: boolean) => {
  //   console.log('object');
  //   console.log(modeSelect.value);
  // if (!modeType || !status) {
  //   createErrorModal({
  //     title: 'Tips',
  //     content: `The ${mode} mode is not detected by the system and cannot be set up and run. Please consult your distributor or installer for further details.`,
  //   });
  //   return;
  // }
  // emit('toSetting', mode);
  // };

  const handleChange: SelectProps['onChange'] = (value) => {
    console.log(value);
    pairingStatus.value = null;
  };

  var intervalId: any;
  const pairConnect = async () => {
    if (pairingStatus.value !== 0) {
      // 1、请求新接口
      await wattmatePreConfig({
        subSysId: subSysId,
        workMode: modeSelect.value === 'EMS Mode' ? 0 : modeSelect.value === 'Meter Mode' ? 1 : 2,
      });

      // 2、轮训10秒
      pairingStatus.value = 1;
      intervalId = setInterval(() => {
        switch (modeSelect.value) {
          case 'ems':
            if (emsMode.value === true) {
              console.log('haha');
              pairingStatus.value = 0;
              clearInterval(intervalId);
            }
            break;
          case 'inverter':
            if (inverterMode.value) {
              pairingStatus.value = 0;
              clearInterval(intervalId);
            }
            break;
          default:
            if (meterMode.value) {
              pairingStatus.value = 0;
              clearInterval(intervalId);
            }
            break;
        }
      }, 1000);
      setTimeout(() => {
        clearInterval(intervalId);
        if (pairingStatus.value === 1) {
          pairingStatus.value = -1;
        }
      }, 10000);
    } else {
      pairingStatus.value = null;
      emit('toSetting', modeSelect.value);
    }
  };
</script>

<style lang="less" scoped>
  .select-mode {
    height: 600px;
  }
  .mode-title {
    color: #2c2d30;
    font-size: 30px;
    font-weight: 600;
  }
  .devices {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .device-img {
    margin-top: 155px;
    position: relative;
  }
  .contected {
    color: #0bed22;
    font-size: 18px;
    margin-top: 24px;
  }
  .uncontected {
    color: #f52424;
    font-size: 18px;
    margin-top: 24px;
  }
  .mode-img {
    height: 220px;
  }
  .mode-green-1 {
    position: absolute;
    width: 23px;
    top: 102px;
    left: 22px;
  }

  .mode-green-2 {
    position: absolute;
    width: 23px;
    top: 102px;
    left: 52px;
  }
  .mode-green-3 {
    position: absolute;
    width: 23px;
    top: 102px;
    left: 81px;
  }
  .mode-green-4 {
    position: absolute;
    width: 23px;
    top: 102px;
    left: 111px;
  }
  .mode-red-5 {
    position: absolute;
    width: 23px;
    top: 102px;
    left: 141px;
  }

  .mode-desc {
    margin-top: 104px;
    color: #077deb;
    font-size: 16px;
    font-weight: 500;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    margin-top: 25px;
    width: 292px;
    height: 43px;
    border-radius: 10px;
    border: 1px solid #000;
    color: #2c2d30;
    font-size: 18px;
    font-weight: 500;
    padding: 0 28px;
    cursor: pointer;
    &:hover {
      background: #077deb;
      border: 1px solid #077deb;
      color: #fff;
    }
  }
</style>
