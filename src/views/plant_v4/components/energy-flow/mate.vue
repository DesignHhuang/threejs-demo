<template>
  <div class="mate-container">
    <div class="flex justify-between">
      <div class="mode-text">{{ modeText }}</div>
      <span class="mode-setting" @click="openModeSetting">
        <Icon icon="majesticons:settings-cog" color="#2D2D2D" :size="1" />
      </span>
    </div>
    <div class="flex items-center justify-center">
      <img class="mate-img" :src="mate" alt="mate" />
      <img :src="green" alt="green" class="lights light1" :class="light1Status" />
      <img :src="green" alt="green" class="lights light2" :class="light2Status" />
      <img :src="green" alt="green" class="lights light3" :class="light3Status" />
      <img :src="green" alt="green" class="lights light4" :class="light4Status" />
      <img :src="red" alt="red" class="lights light5" :class="light5Status" />
    </div>
    <div class="mate-info flex items-center justify-center">
      <div class="flex items-center">
        <Icon v-if="signal" icon="meter_signal|svg" :size="1" />
        <Icon v-else icon="meter_signal_lost|svg" :size="1" />
      </div>
      <Divider type="vertical" />
      <div class="flex items-center">
        <Icon v-if="signal" icon="meter_thunder|svg" :size="1" />
        <Icon v-else icon="thunder_grey|svg" :size="1" />
        <span style="min-width: 50px; text-align: center">
          {{ power }}{{ power === '--' ? '' : 'W' }}
        </span>
      </div>
      <Divider type="vertical" />
      <div class="flex items-center">
        <Icon v-if="workStatus === 0 && signal" icon="mate-idle|svg" :size="1" />
        <Icon v-if="workStatus === 0 && !signal" icon="mate-idle-grey|svg" :size="1" />
        <span v-if="workStatus === 0" class="ml-1">Idle</span>
        <Icon v-if="workStatus === 1 && signal" icon="mate-solar|svg" :size="1" />
        <Icon v-if="workStatus === 1 && !signal" icon="mate-solar-grey|svg" :size="1" />
        <span v-if="workStatus === 1" class="ml-1">Solar Heating</span>
        <Icon v-if="workStatus === 2 && signal" icon="mate-grid|svg" :size="1" />
        <Icon v-if="workStatus === 2 && !signal" icon="mate-grid-grey|svg" :size="1" />
        <span v-if="workStatus === 2" class="ml-1">Grid Heating</span>
        <Icon v-if="workStatus === 3 && signal" icon="mate-sg|svg" :size="1" />
        <Icon v-if="workStatus === 3 && !signal" icon="mate-sg-grey|svg" :size="1" />
        <span v-if="workStatus === 3" class="ml-1">Solar&Grid</span>
        <Icon v-if="workStatus === 4 && signal" icon="mate-ems|svg" :size="1" />
        <Icon v-if="workStatus === 4 && !signal" icon="mate-ems-grey|svg" :size="1" />
        <span v-if="workStatus === 4" class="ml-1">EMS Control</span>
        <Icon v-if="workStatus === 5 && signal" icon="mate-faulty|svg" :size="1" />
        <Icon v-if="workStatus === 5 && !signal" icon="mate-faulty-grey|svg" :size="1" />
        <span v-if="workStatus === 5" class="ml-1">Faulty</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject } from 'vue';
  import { Divider } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import mate from '@/assets/svg/WattMate.svg';
  import green from '@/assets/svg/MateGreen.svg';
  import red from '@/assets/svg/MateRed.svg';
  import { getStatusClass } from '/@/utils/helper/mateHelper';
  import { useMessage } from '@/hooks/web/useMessage';

  const emit = defineEmits(['open-setting']);

  const wattMateData = inject('WattMateData') as any;
  const { createErrorModal } = useMessage();

  const modeValue = [
    {
      id: 0,
      value: 'ems',
      text: 'EMS MODE',
    },
    {
      id: 1,
      value: 'meter',
      text: 'METER MODE',
    },
    {
      id: 2,
      value: 'inverter',
      text: 'INVERTER MODE',
    },
  ];

  const modeText = computed(() => {
    if (wattMateData.value) {
      return modeValue.find((res) => res.id === wattMateData.value?.currentMode)?.text;
    } else {
      return 'EMS MODE';
    }
  });
  const signal = computed(() => wattMateData.value?.comStatus ?? false);
  const power = computed(() => wattMateData.value?.currentPower ?? 0);
  //0: Waiting for surplus 1: Heating 2: Max temp reached 3: Boosting 4: Error
  const workStatus = computed(() => wattMateData.value?.workStatus ?? 1);

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

  const openModeSetting = () => {
    if (!signal.value) {
      createErrorModal({
        title: 'Tips',
        content: 'Device offline',
      });
      return;
    }
    emit('open-setting');
  };
</script>

<style lang="less" scoped>
  .mate-container {
    padding: 10px;
  }
  .mate-img {
    display: flex;
    margin: auto;
    padding: 40px;
  }
  .lights {
    position: absolute;
    margin-top: -4px;
  }
  .light1 {
    margin-left: -133px;
  }
  .light2 {
    margin-left: -96px;
  }
  .light3 {
    margin-left: -58px;
  }
  .light4 {
    margin-left: -21px;
  }
  .light5 {
    margin-left: 16px;
  }
  .mate-info {
    height: 60px;
    padding: 0 16px;
    border-radius: 15px;
    background: #e6e8ee;
    box-shadow: 0px -1px 2px 0px #fff inset, 0px 2px 2px 0px rgba(0, 0, 0, 0.12) inset;
    color: #2d2d2d;
    font-weight: 600;
  }
  .mode-text {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90px;
    height: 20px;
    border-radius: 10px;
    color: #2d2d2d;
    font-size: 10px;
    font-weight: 600;
    background: #e6e8ee;
    box-shadow: 0px -1px 2px 0px #fff inset, 0px 2px 2px 0px rgba(0, 0, 0, 0.12) inset;
  }
  .mode-setting {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background: #e6e8ee;
    box-shadow: 0px -1px 2px 0px #fff inset, 0px 2px 2px 0px rgba(0, 0, 0, 0.12) inset;
    cursor: pointer;
  }
</style>
