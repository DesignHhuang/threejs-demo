<template>
  <PageWrapper :breadcrumbs="breadcrumbs" contentClass="plantDetailNoBottom">
    <template #tags>
      <Tooltip>
        <template #title>{{ focusStatus ? 'Click to cancel focus' : 'Click to focus' }}</template>
        <Icon
          class="subscribe"
          :icon="focusStatus ? 'focus|svg' : 'un_focus|svg'"
          @click="setFocus"
        />
      </Tooltip>
    </template>

    <div class="segmented">
      <div class="to-page active plant-detail-active" @click="go(`/plantList/${plantID}/overview`)">
        <Icon icon="overview|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Overview</span>
      </div>
      <div class="to-page" style="margin: auto 10px" @click="go(`/plantList/${plantID}/device`)">
        <Icon icon="device|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Device</span>
      </div>
      <div class="to-page" @click="go(`/plantList/${plantID}/info`)">
        <Icon icon="plantinfo|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Plant info</span>
      </div>
    </div>

    <div class="flex w-full">
      <div class="overview-left">
        <div class="overview-1_left mr-2" :class="{ noWattmate: !showEnergy }">
          <div v-if="showEnergy && !firstMate" class="mt-8">
            <Empty
              description="System detects that a new WattMate has been added, and whether or not to perform initialization settings"
            >
              <a-button @click="openModal">Set up</a-button>
            </Empty>
          </div>
          <EnergyFlow v-if="showEnergy && firstMate" @openSetting="openSetting" />
        </div>
      </div>
      <div class="overview-right ml-2">
        <div class="overview-location">
          <div class="plant-status">
            <div class="plant-status-con">
              <div class="flex">
                <img :src="runningStatus.icon" class="w-h-50" alt="runningStatus" />
                <div>
                  <div class="plant-status-name">{{ runningStatus.name }}</div>
                  <div class="plant-status-desc">Running status</div>
                </div>
              </div>
              <div class="flex">
                <img class="w-h-50" :src="comStatus.icon" alt="comStatus" />
                <div>
                  <div class="plant-status-name">{{ comStatus.name }}</div>
                  <div class="plant-status-desc">COM.</div>
                </div>
              </div>
              <div class="flex">
                <img :src="clock_v4" class="w-h-50" alt="clock_v4" />
                <div>
                  <div class="plant-status-name">{{ now }}</div>
                  <div class="plant-status-desc">Local time ({{ plantInfo.utc }})</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Weather :plant-id="plantID" :plantInfo="plantBasicInfo" />
      </div>
    </div>

    <PowerOverview class="w-full" :subSysList="subSysList" :timezone="plantBasicInfo?.timezone" />

    <div class="flex w-full mt-4 mb-4">
      <ServiceTicket :plantId="plantID" />
      <SystemLog :plantId="plantID" />
      <StatisticalData v-if="!onlyMate" :overview="overview" />
    </div>

    <!-- 热水器配置窗口页面 -->
    <HeaterMode @register="register" @to-setting="openSetting" />
    <ModeSetting
      @register="registerEmsSetting"
      @run="run({ type: 4, condition: subSysId as string })"
      :minHeight="600"
    />
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed, onUnmounted, provide, ref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { PageWrapper } from '@/components/Page';
  import { useModal } from '@/components/Modal';
  import offlineSvg from '/@/assets/svg/offline.svg';
  import dayjs from 'dayjs';
  import { useRequest } from 'vue-request';
  import { Empty, Tooltip } from 'ant-design-vue';
  import {
    getSubSysIdList,
    getOverview,
    getPlantInfo,
    getWattmateData,
    plantFocus,
    getPlantInfoById,
  } from '/@/api/wattspace/powerStation';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';
  import { useRoute } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';
  import PowerOverview from './components/power-overview/index.vue';
  import ServiceTicket from './components/service-ticket.vue';
  import SystemLog from './components/system-log/index.vue';
  import StatisticalData from './components/statistical-data.vue';
  import Weather from './components/weather.vue';
  import HeaterMode from './components/heater/mode.vue';
  import ModeSetting from './components/heater/mode-setting.vue';
  import EnergyFlow from './components/energy-flow/index.vue';
  import { every } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';

  import offline_v4 from '/@/assets/svg/offline_v4.svg';
  import online_v4 from '/@/assets/svg/online_v4.svg';
  import comstatus_partially_v4 from '/@/assets/svg/comstatus_partially_v4.svg';
  import device_unbound_v4 from '/@/assets/svg/device_unbound_v4.svg';
  import plant_list_normal_v4 from '/@/assets/svg/plant_list_normal_v4.svg';
  import plant_list_attention_v4 from '/@/assets/svg/plant_list_attention_v4.svg';
  import plant_list_no_v4 from '/@/assets/svg/plant_list_no_v4.svg';
  import clock_v4 from '/@/assets/svg/clock_v4.svg';
  import { formatToDateMin } from '/@/utils/dateUtil';

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const route = useRoute();
  const { createMessage } = useMessage();
  const [register, { openModal, closeModal }] = useModal();
  const [registerEmsSetting, { openModal: openModeSetting }] = useModal();

  const plantInfo = ref<any>({});
  const now = ref(formatToDateMin(dayjs()));

  const openSetting = (modeType: string) => {
    closeModal();
    cancel();
    openModeSetting(true, { mode: modeType });
  };

  let plantID = route.params.plantId as string;

  useRequest(getPlantInfoById, {
    manual: false,
    defaultParams: [{ plantIds: [plantID] }],
    onSuccess: (data) => {
      plantInfo.value = data[0];
      now.value = formatToDateMin(dayjs().tz(plantInfo.value.timezone));
    },
  });

  const runningStatus = computed(() => {
    if (plantInfo.value.runningStatus === 0) {
      return { name: 'Normal', icon: plant_list_normal_v4 };
    }
    if (plantInfo.value.runningStatus === 1) {
      return { name: 'Attention', icon: plant_list_attention_v4 };
    }
    if (plantInfo.value.runningStatus === null) {
      return { name: '--', icon: plant_list_no_v4 };
    }
    return { name: 'Normal', icon: plant_list_normal_v4 };
  });

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

  let focusStatus = ref<boolean>(false);
  let isFocus = route.params.isFocus as string;
  if (isFocus === 'true') {
    focusStatus.value = true;
  }

  const go = useGo();

  const { data: plantBasicInfo } = useRequest(getPlantInfo, {
    manual: false,
    defaultParams: [plantID],
  });
  const breadcrumbs = computed(() => [
    {
      path: '/plantList/index',
      name: 'Plant List',
    },
    {
      name: `${plantBasicInfo.value?.plantName} plant`,
    },
  ]);

  // 获取overview信息
  const utcOffset = dayjs().utcOffset();
  const { data: overview } = useRequest(getOverview, {
    manual: false,
    defaultParams: [{ plantId: plantID, offset: utcOffset }],
    onSuccess(data) {
      if (data.focus) {
        focusStatus.value = true;
      }
    },
  });

  const WattMateData = ref();
  const showEnergy = ref(false);
  const firstMate = ref(false);
  const onlyMate = ref(false);
  const init = ref(true);
  const subSysId = ref<string>();
  const subSysList = ref([]);

  const { run, cancel } = useRequest(getWattmateData, {
    pollingInterval: 5000,
    onSuccess: (data) => {
      // console.log(data);
      WattMateData.value = data;
      firstMate.value = data.initStatus;
      if (!firstMate.value) {
        // 弹出初始化框
        init.value &&
          openModal(true, {
            subSysId,
          });
        init.value = false;
      }
    },
  });

  // 查询电站下的子系统ID
  useRequest(getSubSysIdList, {
    manual: false,
    defaultParams: [plantID],
    onSuccess: async (data) => {
      subSysList.value = data;
      // 获取热水器的信息
      const wattmate = data.filter((res) => res.type === 1);
      // 判断是否只有热水器
      onlyMate.value = every(data, ['type', 1]);
      if (wattmate.length > 0) {
        showEnergy.value = true;
        subSysId.value = wattmate[0].subSysId;
        run({ type: 4, condition: subSysId.value as string });
      } else {
        showEnergy.value = false;
      }
    },
  });

  provide('WattMateData', WattMateData);
  /* onMounted(() => {
    run(plantID);
  }); */

  onUnmounted(() => {
    cancel();
  });

  function setFocus() {
    plantFocus({ plantId: plantID, focus: !focusStatus.value }).then((res) => {
      console.log(res);
      if (res) {
        focusStatus.value = !focusStatus.value;
        createMessage.success(focusStatus.value ? 'Focused' : 'Cancelled focus');
      }
    });
  }
</script>

<style lang="less">
  @import './index.less';
</style>
