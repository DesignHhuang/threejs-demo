<template>
  <div ref="elEnergy" class="flex justify-center items-center h-full">
    <div id="energyFlow" class="ems-card">
      <div v-if="mateSelect === 0" class="flex justify-center items-center">
        <div class="card-style ems-container">
          <img :src="ems" alt="ems" />
        </div>
        <div class="ems-signal">
          <Vue3Lottie
            v-if="emsComStatus"
            :animationLink="`${ossUrl}/ems/signal.json`"
            :width="250"
          />
          <img v-else :src="emsSignal" width="250" alt="emsSignal" />
        </div>
        <div class="card-style mate-con">
          <Mate @openSetting="setting('ems')" />
        </div>
        <div class="ems-motion-mate">
          <img v-if="powerStatus" :src="power" width="250" alt="power" />
          <Vue3Lottie v-else :animationLink="`${ossUrl}/ems/power.json`" :width="250" />
        </div>
        <div class="card-style">
          <Jiareban />
        </div>
      </div>
      <div v-if="mateSelect === 1" class="flex justify-center items-center">
        <div>
          <div class="flex">
            <div class="card-style inverter-container">
              <img :src="grid" alt="grid" />
            </div>
          </div>
          <div class="card-style inverter-container mt-4">
            <img :src="inverter" alt="inverter" />
          </div>
        </div>
        <div>
          <Vue3Lottie
            v-if="gridAccessStatus"
            :animationLink="`${ossUrl}/meter/power-top.json`"
            :width="300"
          />
          <img v-else :src="top" alt="top" width="300" />
          <Vue3Lottie
            v-if="pcsAccessStatus"
            :animationLink="`${ossUrl}/meter/power-down.json`"
            :width="300"
          />
          <img v-else :src="bottom" alt="bottom" width="300" />
          <div class="meter-signal-wrap flex items-center pl-6 pr-6">
            <div class="card-style inverter-container">
              <img :src="meter" alt="meter" />
              <div class="mater-info ml-3">
                <div class="info-label">INJUCTION</div>
                <div class="flex items-center mb-2">
                  <Icon icon="mdi:thunder" color="#00A3FF" :size="1" />
                  <div class="info-text">{{ injection }}W</div>
                </div>
                <div class="info-label mt-2">PURCHASE</div>
                <div class="flex items-center">
                  <Icon icon="mdi:thunder" color="#00A3FF" :size="1" />
                  <div class="info-text">{{ purchase }}W</div>
                </div>
              </div>
            </div>
            <div class="meter-signal">
              <Vue3Lottie
                v-if="meterComStatus"
                :animationLink="`${ossUrl}/meter/signal.json`"
                :width="200"
              />
              <img v-else :src="signal" alt="signal" width="200" />
            </div>
          </div>
        </div>
        <div class="card-style mate-con">
          <Mate @openSetting="setting('meter')" />
        </div>
        <div class="ems-motion-mate">
          <img v-if="powerStatus" :src="power" width="200" alt="power" />
          <Vue3Lottie v-else :animationLink="`${ossUrl}/ems/power.json`" :width="200" />
        </div>
        <div class="card-style">
          <Jiareban />
        </div>
      </div>
      <div v-if="mateSelect === 2" class="flex justify-center items-center">
        <div class="inverter-input">
          <div class="card-style inverter-container">
            <img :src="inverter" alt="inverter" />
          </div>
          <div class="card-style inverter-container mt-4">
            <img :src="grid" alt="ems" />
          </div>
        </div>
        <div class="inverter-signal">
          <div>
            <Vue3Lottie
              v-if="pcsComStatus"
              :animationLink="`${ossUrl}/inverter/signal.json`"
              :width="200"
            />
            <img v-else :src="signal" width="200" alt="signal" />
            <Vue3Lottie
              v-if="pcsAccessStatus"
              :animationLink="`${ossUrl}/inverter/power-up.json`"
              :width="200"
            />
            <img v-else :src="top" width="200" alt="top" />
          </div>
          <Vue3Lottie
            v-if="gridAccessStatus"
            :animationLink="`${ossUrl}/inverter/power-down.json`"
            :width="200"
          />
          <img v-else :src="bottom" width="200" alt="bottom" />
        </div>

        <div class="card-style mate-con">
          <Mate @openSetting="setting('inverter')" />
        </div>
        <div class="ems-motion-mate">
          <img v-if="powerStatus" :src="power" width="200" alt="power" />
          <Vue3Lottie v-else :animationLink="`${ossUrl}/ems/power.json`" :width="200" />
        </div>
        <div class="card-style">
          <Jiareban />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, onBeforeUnmount, onMounted, ref, unref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { addResizeListener, removeResizeListener } from '@/utils/event';
  import { Vue3Lottie } from 'vue3-lottie';
  import ems from '@/assets/svg/ems.svg';
  import Mate from './mate.vue';
  import Jiareban from './jiareban.vue';
  import inverter from '@/assets/svg/Inverter.svg';
  import grid from '@/assets/svg/Grid.svg';
  import meter from '@/assets/svg/Meter.svg';

  import emsSignal from '@/assets/images/ems-signal.png';
  import signal from '@/assets/images/signal.png';
  import power from '@/assets/images/power.png';
  import top from '@/assets/images/top.png';
  import bottom from '@/assets/images/bottom.png';

  const emit = defineEmits(['open-setting']);

  const wattMateData = inject('WattMateData') as any;

  const injection = computed(() => wattMateData.value?.injection ?? 0);
  const purchase = computed(() => wattMateData.value?.purchase ?? 0);
  const emsComStatus = computed(() => wattMateData.value?.emsComStatus);
  const powerStatus = computed(
    () => wattMateData.value?.currentPower === '--' || wattMateData.value?.currentPower === '0',
  );
  const meterComStatus = computed(() => wattMateData.value?.meterComStatus);
  const gridAccessStatus = computed(() => wattMateData.value?.gridAccessStatus);
  const pcsAccessStatus = computed(() => wattMateData.value?.pcsAccessStatus);
  const pcsComStatus = computed(() => wattMateData.value?.pcsComStatus);

  const ossUrl = 'https://oss.wattsonic.com/desk-v4-test';
  const mateSelect = computed(() => wattMateData.value?.currentMode);
  const elEnergy = ref();

  const update = () => {
    if (!unref(elEnergy)) return;
    const energyFlow = document.getElementById('energyFlow');
    if (energyFlow) {
      const elScale = unref(elEnergy).clientWidth / 1230;
      const scale = elScale < 1 ? elScale : 1;
      // 计算流动图的scale大小
      energyFlow.style.transform = `scale(${scale})`;
    }
  };

  const setting = (mode: string) => {
    emit('open-setting', mode);
  };

  onMounted(() => {
    addResizeListener(unref(elEnergy), update);
    addEventListener('resize', update);
  });

  onBeforeUnmount(() => {
    removeResizeListener(unref(elEnergy), update);
    removeEventListener('resize', update);
  });
</script>

<style lang="less" scoped>
  .ems-signal {
    position: relative;
    margin: 0 -40px;
    z-index: -1;
  }
  .mate-con {
    transition: all 0.8s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0px 2px 3px 0px rgba(255, 255, 255, 0.5) inset,
        0px 1.5px 1px 0px rgba(255, 255, 255, 0.4) inset,
        0px -1.5px 1px 0px rgba(255, 255, 255, 0.35) inset, 0px 2px 6px 0px #d3e7ff,
        0px 10px 20px 0px #90b1f3, 0px 0.5px 2px 0px #fff inset;
    }
  }
  .meter-signal-wrap {
    position: absolute;
    top: 12px;
  }
  .meter-signal {
    margin: 0 -40px;
    z-index: -1;
  }
  .inverter-signal {
    top: -30px;
    position: relative;
    margin: 0 -20px;
    width: 220px;
    z-index: -1;
  }
  .ems-motion-mate {
    position: relative;
    z-index: -1;
  }
  .ems-card {
    width: 1230px;
    position: relative;
    padding: 0 30px;
  }
  .card-style {
    border-radius: 20px;
    border: 1px solid #fff;
    background: #eceef5;
    box-shadow: 0px 2px 3px 0px rgba(255, 255, 255, 0.5) inset,
      0px 1.5px 1px 0px rgba(255, 255, 255, 0.4) inset,
      0px -1.5px 1px 0px rgba(255, 255, 255, 0.35) inset, 0px 2px 6px 0px #d3e7ff,
      0px 10px 13.5px 0px #cddaf5, 0px 0.5px 2px 0px #fff inset;
  }
  .ems-container {
    padding: 40px;
    img {
      width: 90px;
    }
  }
  .inverter-container {
    width: 180px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .inverter-input {
    display: flex;
    flex-direction: column;
  }

  .mater-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 8px;
    height: 130px;
    border-radius: 15px;
    background: #e6e8ee;
    box-shadow: 0px -1px 2px 0px #fff inset, 0px 2px 2px 0px rgba(0, 0, 0, 0.12) inset;
  }
  .info-label {
    color: #6e737b;
    font-size: 10px;
    font-weight: 600;
  }
  .info-text {
    color: #2d2d2d;
    font-weight: 600;
  }
</style>
