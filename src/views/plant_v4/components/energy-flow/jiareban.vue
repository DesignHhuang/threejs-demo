<template>
  <div class="jiareban-container">
    <div class="mate-img">
      <span class="currentTemp" v-if="heater.currentTemp === '--'">--</span>
      <span class="currentTemp" v-else>{{ heater.currentTemp }}℃</span>
      <img class="jiareban" :src="jiareban" alt="jiareban" />
    </div>

    <div class="mate-info flex items-center justify-center">
      <div class="flex items-center">
        <Icon v-if="signal" icon="meter_temp|svg" :size="1" />
        <Icon v-else icon="meter_temp_grey|svg" :size="1" />
        <div>
          <div class="info-label">TEMP</div>
          <div v-if="heater.targetTemp === '--'">--</div>
          <div v-else>{{ heater.targetTemp }}℃/{{ maxTemp }}℃</div>
        </div>
      </div>
      <Divider type="vertical" />
      <div class="flex items-center">
        <Icon v-if="signal" icon="meter_thunder|svg" :size="1" />
        <Icon v-else icon="thunder_grey|svg" :size="1" />
        <div>
          <div class="info-label">POWER</div>
          <div>{{ heater.currentPower }}{{ heater.currentPower === '--' ? '' : 'W' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject } from 'vue';
  import { Divider } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import jiareban from '@/assets/svg/jiareban.svg';

  const wattMateData = inject('WattMateData') as any;
  const maxTemp = computed(() => wattMateData.value?.maxTemp ?? 0);
  const signal = computed(() => wattMateData.value?.comStatus ?? false);

  const heater = computed(() => {
    if (wattMateData.value) {
      return wattMateData.value?.heaterVoList[0];
    } else {
      return {
        currentTemp: 0,
        targetTemp: 0,
        currentPower: 0,
      };
    }
  });
</script>

<style lang="less" scoped>
  .jiareban-container {
    padding: 10px;
  }
  .mate-img {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    padding: 40px;
    position: relative;
    .jiareban {
      margin: auto;
    }
    .currentTemp {
      position: absolute;
      color: #2d2d2d;
      font-weight: 600;
      margin-left: 18px;
      margin-bottom: 40px;
    }
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
  .info-label {
    color: #6e737b;
    font-size: 10px;
    font-weight: 600;
  }
</style>
