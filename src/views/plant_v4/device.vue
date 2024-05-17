<template>
  <PageWrapper :breadcrumbs="breadcrumbs" contentClass="plantDetailNoBottom">
    <div class="segmented">
      <div class="to-page" @click="go(`/plantList/${plantID}/overview`)">
        <Icon icon="overview|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Overview</span>
      </div>
      <div
        class="to-page active plant-detail-active"
        style="margin: auto 10px"
        @click="go(`/plantList/${plantID}/device`)"
      >
        <Icon icon="device|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Device</span>
      </div>
      <div class="to-page" @click="go(`/plantList/${plantID}/info`)">
        <Icon icon="plantinfo|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Plant info</span>
      </div>
    </div>

    <div class="toolbar">
      <div></div>
      <!-- <watt-button @click="expandAll">Expand</watt-button>
        <watt-button @click="collapseAll" style="margin-left: 12px">Collapse</watt-button> -->
      <div v-if="canAddDevice" class="add-btn-px plant-device-add" @click="openAddDevice">
        <div class="text-left"> Add </div>
        <div class="text-icon">
          <img class="text-icon-img" :src="add_v4" :alt="add_v4" />
        </div>
      </div>
    </div>

    <BasicTable @register="register">
      <template #bodyCell="{ column, record }">
        <template v-if="column?.key === 'softwareVersion'">
          {{ record?.softwareVersion }}
          <Tag color="green" v-if="record?.needUpgrade && record?.loggerSn">new</Tag>
        </template>

        <template v-if="column?.key === 'action'">
          <div class="device-action">
            <!-- deviceType:0总控、1主控、2从控、3IOT、10热水器 -->
            <template v-if="record?.deviceType === 10">
              <div class="ml-1 mr-1">
                <Tooltip
                  v-if="
                    userStore.getPermitsList.filter(
                      (res) => res.name === 'Config device' && res.isGranted === true,
                    ).length > 0
                  "
                  title="Operate"
                >
                  <div class="action-btn" @click="setting(record.batId)">
                    <Icon icon="heater_setting|svg" :size="2" />
                  </div>
                </Tooltip>
              </div>
            </template>
            <!-- upgradeResult 最新升级结果 0升级中 1升级成功 2升级失败 -->
            <template v-if="record?.showUpgrade">
              <div class="ml-1 mr-1">
                <Upgrade
                  v-if="record.upgradeResult !== null && record.isStart"
                  :upgradeResult="record.upgradeResult"
                  :percent="record.percent"
                  @close="handleClose(record)"
                  @open-upgrade="openUpdateInfoModalHandler(record)"
                />
                <template v-if="record.upgradeResult !== 0 && !record.isStart && canUpgrade">
                  <Tooltip v-if="!record.needUpgrade" title="This is the latest version.">
                    <Popconfirm disabled>
                      <div class="action-btn">
                        <Icon icon="upgrade|svg" />
                      </div>
                    </Popconfirm>
                  </Tooltip>
                  <div v-else class="action-btn" @click="openUpdateInfoModalHandler(record)">
                    <Icon icon="upgrade|svg" />
                  </div>
                </template>
              </div>
            </template>
          </div>
        </template>
      </template>
    </BasicTable>

    <AddDeviceModal @register="addPlantModal" @add-device-success="reloadData" />
    <!-- 热水器配置窗口页面 -->
    <HeaterMode @register="registerModeSetting" @to-setting="openSetting" />
    <ModeSetting @register="registerEmsSetting" @run="fetchUpgradeInfo(plantID)" :minHeight="600" />
    <UpdateInfoModal
      @register="updateInfoModal"
      @start-upgrade="upgradeDevice"
      :curOpeDevice="curOpeDevice"
    />
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref, unref, onUnmounted, computed, provide } from 'vue';
  import AddDeviceModal from './components/addDevice/index.vue';
  import UpdateInfoModal from './components/deviceUpdateModal/index.vue';
  import { Tooltip, Tag, Popconfirm } from 'ant-design-vue';
  import { BasicTable, useTable } from '@/components/Table';
  import Icon from '@/components/Icon/Icon.vue';
  import { PageWrapper } from '@/components/Page';
  import { calPercent } from './components/power-overview/useStatistics';
  import { useRequest } from 'vue-request';
  import {
    getDeviceList,
    getPlantInfo,
    getSubSysIdList,
    getWattmateData,
  } from '/@/api/wattspace/powerStation';
  import { useRoute } from 'vue-router';
  import { getBasicColumns } from './tableData';
  import { upgradeDeviceBySubSysId } from '/@/api/wattspace/bmsPackage';
  import Upgrade from './Upgrade.vue';
  import { useSocket } from '/@/hooks/web/useSocket';
  import { getUpgradeRes } from '/@/api/wattspace/devices';
  import { useGo } from '/@/hooks/web/usePage';
  import { useModal } from '@/components/Modal';
  import HeaterMode from './components/heater/mode.vue';
  import ModeSetting from './components/heater/mode-setting.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import add_v4 from '@/assets/svg/add_v4.svg';

  const route = useRoute();
  const go = useGo();
  const userStore = useUserStore();
  const { disconnect, activate, subscribeTopicId, unSubscribeTopicId } = useSocket();

  const [registerModeSetting, { openModal: openModeModal, closeModal }] = useModal();
  const [registerEmsSetting, { openModal: openModeSetting }] = useModal();
  const [updateInfoModal, { openModal: openUpdateInfoModal }] = useModal();

  let plantID = route.params.plantId as string;
  const devices = ref();
  const currentDeviceId = ref();
  const curOpeDevice = computed(() => {
    if (devices.value && devices.value.length > 0 && currentDeviceId.value) {
      return devices.value.find((res) => res.deviceId === currentDeviceId.value);
    } else {
      return null;
    }
  });

  const [addPlantModal, { openModal }] = useModal();

  const canUpgrade = computed(
    () =>
      userStore.getPermitsList.filter(
        (res) => res.name === 'Upgrade device' && res.isGranted === true,
      ).length > 0,
  );

  const canAddDevice = computed(
    () =>
      userStore.getPermitsList.filter((res) => res.name === 'Bind device' && res.isGranted === true)
        .length > 0,
  );

  const openAddDevice = () => {
    openModal(true, {
      plantID: plantID,
    });
  };

  const openSetting = (modeType: string) => {
    closeModal();
    openModeSetting(true, { mode: modeType });
  };

  const openUpdateInfoModalHandler = (record) => {
    currentDeviceId.value = record.deviceId;
    openUpdateInfoModal(true, {
      modelId: record.modelId,
    });
  };

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
      name: `${plantBasicInfo.value?.plantName} device`,
    },
  ]);

  const updateDeviceVersion = (devices, softwareVersion) => {
    devices.map((res) => {
      updateTableDataRecord(res.deviceId, { ...res, needUpgrade: false, softwareVersion });
      res.deviceList && updateDeviceVersion(res.deviceList, softwareVersion);
    });
  };

  const shouldUpgrade = ref();
  const socketUpdata = async (data: any, record) => {
    const jsonBody = JSON.parse(data.body);
    if (jsonBody) {
      // 清理当前的订阅
      unSubscribeTopicId(record.upgradeTraceId, '/upgrade/');
      // 清理当前的Interval
      const currentTimer = unref(upgradeTimers).find((res) => res.deviceId === record.deviceId);
      currentTimer && clearInterval(currentTimer.timer);
      updateTableDataRecord(record.deviceId, { ...record, showUpgrade: true, percent: 100 });
      if (jsonBody === 1) {
        // 获取升级后的信息,更新当前设备及子设备的版本信息
        const data = await getUpgradeRes(record.upgradeTraceId);
        updateTableDataRecord(record.deviceId, {
          ...record,
          showUpgrade: true,
          upgradeResult: 1,
          needUpgrade: false,
          softwareVersion: record.loggerSn ? data.newVersion : record.softwareVersion,
        });
        record.deviceList && updateDeviceVersion(record.deviceList, data.newVersion);
        shouldUpgrade.value = false;
      }
      if (jsonBody === 2) {
        shouldUpgrade.value = true;
        updateTableDataRecord(record.deviceId, { ...record, showUpgrade: true, upgradeResult: 2 });
      }
    }
  };

  const handleClose = (record) => {
    updateTableDataRecord(record.deviceId, {
      ...record,
      showUpgrade: true,
      needUpgrade: shouldUpgrade.value,
      upgradeResult: null,
      isStart: false,
    });
  };

  const upgradeTimers = ref<{ timer: any; deviceId: string }[]>([]);
  // 获取电站中设备列表
  const { run: fetchUpgradeInfo } = useRequest(getDeviceList, {
    manual: false,
    defaultParams: [plantID],
    onSuccess: (data) => {
      unref(upgradeTimers).map((res) => clearInterval(res.timer));
      upgradeTimers.value = [];
      // 只有顶级才显示升级信息
      devices.value = data.map((res) => {
        // 正在升级的话，需要计算百分比
        const { upgradeResult, upgradeTraceId, lastUpgradeTime, deviceId, deviceList } = res;
        let percent = 0;
        if (upgradeResult === 0 && upgradeTraceId && lastUpgradeTime) {
          const timer = setInterval(() => {
            let diffSeconds = Math.floor((Date.now() - lastUpgradeTime) / 1000);
            diffSeconds = diffSeconds < 0 ? 0 : diffSeconds;
            percent = calPercent(diffSeconds);
            // 更新列表中的数据
            updateTableDataRecord(deviceId, { ...res, showUpgrade: true, percent, isStart: true });
          }, 1000);
          unref(upgradeTimers).push({ timer, deviceId });
        }
        // deviceList 中过滤出IOT设备，显示升级按钮
        if (deviceList) {
          return {
            ...res,
            showUpgrade: true,
            percent,
            isStart: false,
            deviceList: deviceList.map((subDevice) =>
              subDevice.deviceType === 3
                ? { ...subDevice, ...calNeedUpgrade(subDevice) }
                : subDevice,
            ),
          };
        }
        return { ...res, showUpgrade: true, percent, isStart: false };
      });
      activate(() => {
        devices.value.forEach((res) => {
          const { upgradeTraceId, upgradeResult, lastUpgradeTime } = res;
          if (upgradeResult === 0 && upgradeTraceId && lastUpgradeTime) {
            subscribeTopicId(upgradeTraceId, '/upgrade/', socketUpdata, res);
          }
        });
      });
    },
  });

  const calNeedUpgrade = (record) => {
    // 正在升级的话，需要计算百分比
    const { upgradeResult, upgradeTraceId, lastUpgradeTime, deviceId } = record;
    let percent = 0;
    if (upgradeResult === 0 && upgradeTraceId && lastUpgradeTime) {
      const timer = setInterval(() => {
        let diffSeconds = Math.floor((Date.now() - lastUpgradeTime) / 1000);
        diffSeconds = diffSeconds < 0 ? 0 : diffSeconds;
        percent = calPercent(diffSeconds);
      }, 1000);
      unref(upgradeTimers).push({ timer, deviceId });
    }
    activate(() => {
      if (upgradeResult === 0 && upgradeTraceId && lastUpgradeTime) {
        subscribeTopicId(upgradeTraceId, '/upgrade/', socketUpdata, record);
      }
    });
    return { ...record, showUpgrade: true, percent, isStart: false };
  };

  const [register, { /* expandAll, */ updateTableDataRecord }] = useTable({
    isTreeTable: true,
    columns: getBasicColumns(),
    dataSource: devices,
    childrenColumnName: 'deviceList',
    defaultExpandAllRows: true,
    rowKey: 'deviceId',
    striped: false,
    actionColumn: {
      title: 'Operate',
      dataIndex: 'action',
      fixed: 'right',
    },
  });

  const reloadData = () => {
    fetchUpgradeInfo(plantID);
  };

  const upgradeDevice = async () => {
    const { deviceType, batId } = curOpeDevice.value; //deviceType 0:总控 1:主控 2:从控 3:IOT 10:热水器
    //const topicId = deviceType === 3 ? await upgradeIot(deviceId) : await upgradeBms(batId);
    //upgradeType 0:BMS 1:IOT 2:WATTMATE
    const upgradeType = deviceType === 10 ? 2 : deviceType === 3 ? 1 : 0;
    try {
      const topicId = await upgradeDeviceBySubSysId({ subSysId: batId, upgradeType });
      if (topicId) {
        disconnect();
        fetchUpgradeInfo(plantID);
      }
    } finally {
      return true;
    }
  };
  const { createErrorModal } = useMessage();

  const WattMateData = ref();
  // 0: EMS Mode 1: Meter Mode 2: Inverter Mode
  const mode = [
    { id: 0, value: 'ems' },
    { id: 1, value: 'meter' },
    { id: 2, value: 'inverter' },
  ];
  const { run } = useRequest(getWattmateData, {
    onSuccess: (data) => {
      WattMateData.value = data;
      console.log(data);
      if (!data.comStatus) {
        createErrorModal({
          title: 'Tips',
          content: 'Device offline',
        });
        return;
      }
      if (data.initStatus) {
        openModeSetting(true, { mode: mode.find((res) => res.id === data.currentMode)?.value });
      } else {
        getSubSysIdList(plantID).then((data) => {
          // 获取热水器的信息
          const wattmate = data.filter((res) => res.type === 1);
          if (wattmate.length > 0) {
            openModeModal(true, {
              subSysId: wattmate[0].subSysId,
            });
          }
        });
        // openModeModal();
      }
    },
  });

  const setting = (subSysId: string) => {
    console.log('shezhi');
    run({ type: 4, condition: subSysId });
  };

  /* onMounted(() => {
    setTimeout(expandAll, 300);
  }); */

  onUnmounted(() => {
    disconnect();
    unref(upgradeTimers).map((res) => clearInterval(res.timer));
    upgradeTimers.value = [];
  });

  provide('WattMateData', WattMateData);
</script>

<style lang="less" scoped>
  .device-action {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .action-btn {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: #e2e4ea;
    color: #b6b7ba;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      color: @colorPrimary;
    }
  }
  .toolbar {
    display: flex;
    justify-content: space-between;
  }
  .plant-device-add {
    height: 40px;
    border-radius: 20px;
  }
</style>
