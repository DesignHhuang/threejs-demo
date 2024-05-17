<template>
  <div class="plant-list">
    <div class="plant-list-top-tool">
      <a-input
        placeholder="Search"
        size="large"
        allowClear
        :value="filterStore.getPlantListSearchInfo.keyword"
        class="plantlist-search"
        @change="searchKeyword"
      >
        <template #prefix>
          <div class="input-search-icon">
            <Icon icon="search_v4|svg" style="color: #fff" :size="16" size-type="px" />
          </div>
        </template>
      </a-input>

      <div v-if="hasAuthority('Add plant')" class="add-btn-px" @click="openModal(true)">
        <div class="text-left"> Add </div>
        <div class="text-icon">
          <img :src="add_v4" :alt="add_v4" />
        </div>
      </div>
    </div>

    <div class="plant-list-table">
      <tableHeader ref="headerRef" @filter-action="headerFilterAction" />

      <div class="plant-list-toolbar">
        <a-tree-select
          :bordered="false"
          :dropdownMatchSelectWidth="350"
          v-model:value="selectedCom"
          show-search
          style="width: 150px"
          placeholder="All companies"
          allow-clear
          tree-default-expand-all
          :tree-data="treeData"
          :fieldNames="{ value: 'id' }"
          tree-node-filter-prop="name"
          @focus="onComTreeFocus"
          @change="handleChange"
        >
          <template #title="{ name }">
            {{ name }}
          </template>
        </a-tree-select>
        <div
          class="plant-list-toolbar-btn"
          :class="{ 'toolbar-btn-select': isOfflineSelected }"
          @click="searchPlantList('com', 0)"
        >
          <img :src="plant_list_search_offline_v4" />
          <div>Offline</div>
          <Icon v-if="isOfflineSelected" class="clear-filter" icon="ion:close" />
        </div>
        <div
          class="plant-list-toolbar-btn"
          :class="{ 'toolbar-btn-select': isAttentionSelected }"
          @click="searchPlantList('status', 1)"
        >
          <img :src="plant_list_search_attention_v4" />
          <div>Attention</div>
          <Icon v-if="isAttentionSelected" class="clear-filter" icon="ion:close" />
        </div>
      </div>

      <div class="plant-list-table-body">
        <div
          class="list-table-item"
          :key="station.plantId"
          v-for="station in stationList"
          @click="rowClick(station.plantId)"
        >
          <div class="subscribe">
            <div v-if="station.focus" title="Unfollow this plant">
              <Icon
                class="focus-active"
                icon="focus_active_v4|svg"
                size="26"
                size-type="px"
                @click.stop="setFocus(station.plantId, false)"
              />
            </div>
            <div v-else title="Follow this plant">
              <Icon
                class="focus"
                icon="focus_v4|svg"
                size="26"
                size-type="px"
                @click.stop="setFocus(station.plantId, true)"
              />
            </div>
          </div>
          <div class="name" :title="station.plantName">{{ station.plantName }}</div>
          <div class="com">
            <img v-if="station.comStatus === 0" :src="offline_v4" alt="comstatus_v4" />
            <img v-if="station.comStatus === 1" :src="online_v4" alt="comstatus_v4" />
            <img v-if="station.comStatus === 2" :src="comstatus_partially_v4" alt="comstatus_v4" />
            <img v-if="station.comStatus === -1" :src="device_unbound_v4" alt="comstatus_v4" />
          </div>
          <div class="type">
            <div v-if="station.plantType === 1">Heating System</div>
            <div v-if="station.plantType === 2">Battery System</div>
            <div v-if="station.plantType === 3">Hybrid System</div>
          </div>
          <div class="device">{{ station.plantProductType ?? '--' }}</div>
          <div class="power">
            <div v-if="station.plantType === 1">{{ station.plantPower.wmPower ?? '--' }}</div>
            <div v-else-if="station.plantType === 2">{{ computedPower(station.plantPower) }}</div>
            <div v-else>--</div>
          </div>
          <div class="status">
            <img
              v-if="station.runningStatus === 0"
              :src="plant_list_normal_v4"
              alt="plant_list_normal_v4"
            />
            <img
              v-else-if="station.runningStatus === 1"
              :src="plant_list_attention_v4"
              alt="plant_list_attention_v4"
            />
            <img
              v-else="station.runningStatus === null"
              :src="plant_list_no_v4"
              alt="plant_list_no_v4"
            />
          </div>
          <div
            class="update"
            :title="station.lastUpdateTime ? fromNowFormat(station.lastUpdateTime) : ''"
          >
            {{ station.lastUpdateTime ? fromNowFormat(station.lastUpdateTime) : '' }}
          </div>
        </div>
      </div>
    </div>

    <AddPlantModal @register="addPlantModal" @add-success="handleChange" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useModal } from '@/components/Modal';
  import Icon from '@/components/Icon/Icon.vue';
  import AddPlantModal from './create/index.vue';
  import { useFilterStore } from '/@/store/modules/filters';
  import { useRequest } from 'vue-request';
  import { getPowerStationList, plantFocus } from '/@/api/wattspace/powerStation';
  import { useDebounceFn } from '@vueuse/core';
  import { useGo } from '/@/hooks/web/usePage';
  import { TreeDataItem } from '/#/store';
  import { getComTree } from '/@/api/wattspace/system';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermission } from '/@/hooks/web/usePermission';
  import add_v4 from '@/assets/svg/add_v4.svg';
  import plant_list_normal_v4 from '@/assets/svg/plant_list_normal_v4.svg';
  import plant_list_attention_v4 from '@/assets/svg/plant_list_attention_v4.svg';
  import plant_list_no_v4 from '@/assets/svg/plant_list_no_v4.svg';
  import { fromNowFormat } from '/@/utils/dateUtil';
  import tableHeader from './components/table-header/index.vue';
  import offline_v4 from '@/assets/svg/offline_v4.svg';
  import online_v4 from '@/assets/svg/online_v4.svg';
  import comstatus_partially_v4 from '@/assets/svg/comstatus_partially_v4.svg';
  import device_unbound_v4 from '@/assets/svg/device_unbound_v4.svg';
  import plant_list_search_offline_v4 from '@/assets/svg/plant_list_search_offline_v4.svg';
  import plant_list_search_attention_v4 from '@/assets/svg/plant_list_search_attention_v4.svg';

  const { createMessage } = useMessage();
  const { hasAuthority } = usePermission();

  const filterStore = useFilterStore();
  const go = useGo();
  const selectedCom = ref<string | any>();
  const headerRef = ref();
  const isOfflineSelected = computed(() =>
    headerRef.value ? headerRef.value.isOfflineSelected : false,
  );
  const isAttentionSelected = computed(() =>
    headerRef.value ? headerRef.value.isAttentionSelected : false,
  );

  const { data, run: fetchList } = useRequest(getPowerStationList, {
    manual: false,
    defaultParams: [{ ...filterStore.getPlantListSearchInfo, ...filterStore.getPlantListFilters }],
  });
  const stationList = computed(() => data.value?.records);

  const headerFilterAction = () => {
    fetchList({ ...filterStore.getPlantListSearchInfo, ...filterStore.getPlantListFilters });
  };

  const handleChange = () => {
    filterStore.setPlantListSearchInfo({ companyId: selectedCom.value ? selectedCom.value : '' });
    fetchList({ ...filterStore.getPlantListSearchInfo, ...filterStore.getPlantListFilters });
  };

  const searchPlantList = (type, status) => {
    headerRef.value.setFilter(type, status);
  };

  const computedPower = (plantPower) => {
    const { batChargePower, batDischargePower } = plantPower;
    return batChargePower !== null ? `+${batChargePower}-${batDischargePower}` : '--';
  };

  const treeData = ref<[TreeDataItem]>();

  const onComTreeFocus = () => {
    if (!treeData.value) {
      run();
    }
  };

  // 获取公司列表
  const { run } = useRequest(getComTree, {
    onSuccess: (data) => {
      treeData.value = [data];
    },
  });

  function setFocus(plantId: string, focus: boolean) {
    plantFocus({ plantId, focus }).then((res) => {
      if (res) {
        //createMessage.success(focus ? 'Followed' : 'Unfollowed');
        fetchList({ ...filterStore.getPlantListSearchInfo, ...filterStore.getPlantListFilters });
      } else {
        createMessage.error('Follow failed');
      }
    });
  }

  const searchKeyword = useDebounceFn((e) => {
    filterStore.setPlantListSearchInfo({ keyword: e.target.value });
    fetchList({ ...filterStore.getPlantListSearchInfo, ...filterStore.getPlantListFilters });
  }, 300);

  const rowClick = (plantId: string) => {
    go(`/plantList/${plantId}/overView`);
  };

  const [addPlantModal, { openModal }] = useModal();
</script>

<style lang="less">
  .plant-list {
    width: 100%;
  }
  .plant-list-top-tool {
    display: flex;
    justify-content: center;
    height: 40px;
    margin: 20px 0;
  }

  .plant-list-toolbar {
    position: absolute;
    display: flex;
    align-items: center;
    height: 40px;
    top: -40px;
    input::placeholder {
      color: #808080 !important;
    }
    .clear-filter {
      margin-left: 4px;

      &:hover {
        scale: 1.2;
      }
    }

    .plant-list-toolbar-btn {
      position: relative;
      display: flex;
      align-items: center;
      color: #808080;
      margin-left: 6px;
      padding: 0 4px;
      cursor: pointer;
      border-radius: 10px;
      height: 30px;

      &:hover {
        background: rgba(0, 0, 0, 0.08);
      }
    }

    .toolbar-btn-select {
      background: rgba(0, 0, 0, 0.08);
      color: #000;

      &::after {
        display: block;
        position: absolute;
        content: '';
        z-index: 1;
        left: 0;
        bottom: -6px;
        height: 3px;
        width: 106%;
        background: #000;
      }
    }
  }

  .plant-list-table {
    position: relative;
    margin: 0 auto;
    border-top: 1px solid rgba(0, 0, 0, 0.2);
    max-width: 1860px;

    @media screen and (max-width: 1860px) {
      margin: 0 30px;
    }

    .plant-list-table-header {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      margin: 6px 0;
      .title {
        height: 26px;
        line-height: 26px;
      }
    }
    .list-table-item {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      margin: 2px 0;
      border-radius: 10px;
      cursor: pointer;

      .focus {
        color: #808080;
        cursor: pointer;
        opacity: 0;
        &:hover {
          color: #000;
        }
      }

      .focus-active {
        color: #808080;
        cursor: pointer;
      }

      &:hover {
        .focus {
          opacity: 1;
        }
        .focus-active {
          color: #000;
        }

        background: rgba(0, 0, 0, 0.08);
      }
    }
    .subscribe {
      display: flex;
      align-items: center;
      width: 4rem;
      margin: 0 3px;
    }
    .name {
      width: 17rem;
      margin: 0 3px;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .header-name {
      display: flex;
      align-items: center;
      position: relative;
      color: #808080;
      font-size: 14px;
      height: 40px;
      border-radius: 10px;
      cursor: default;
    }
    .com {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14rem;
      margin: 0 3px;
      img {
        width: 26px;
        height: 26px;
      }
    }
    .header-com {
      position: relative;
      color: #808080;
      font-size: 14px;
      height: 40px;
      border-radius: 10px;
      cursor: pointer;
      &:hover {
        color: #000000;
        background: rgba(0, 0, 0, 0.2);
      }
    }
    .type {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14rem;
      margin: 0 3px;
    }
    .header-type {
      position: relative;
      color: #808080;
      font-size: 14px;
      height: 40px;
      border-radius: 10px;
      cursor: pointer;
      &:hover {
        color: #000000;
        background: rgba(0, 0, 0, 0.2);
      }
    }
    .device {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14rem;
      margin: 0 3px;
    }
    .header-device {
      position: relative;
      color: #808080;
      font-size: 14px;
      height: 40px;
      border-radius: 10px;
      cursor: pointer;
      &:hover {
        color: #000000;
        background: rgba(0, 0, 0, 0.2);
      }
    }
    .power {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14rem;
      margin: 0 3px;
    }
    .header-power {
      position: relative;
      color: #808080;
      font-size: 14px;
      height: 40px;
      border-radius: 10px;
      cursor: default;
    }
    .status {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 3px;
      width: 14rem;
    }
    .header-status {
      position: relative;
      color: #808080;
      font-size: 14px;
      height: 40px;
      border-radius: 10px;
      cursor: pointer;
      &:hover {
        color: #000000;
        background: rgba(0, 0, 0, 0.2);
      }
    }
    .update {
      width: 16rem;
      margin: 0 3px;
      padding-right: 5rem;
      text-align: right;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .header-update {
      display: flex;
      align-items: center;
      justify-content: end;
      position: relative;
      color: #808080;
      font-size: 14px;
      height: 40px;
      border-radius: 10px;
      cursor: pointer;
      &:hover {
        color: #000000;
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }

  .filterActive {
    color: #2c2d30 !important;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    margin-right: 24px;
    cursor: pointer;

    .toolbar-icon-text {
      display: flex;
      flex-direction: column;
      align-items: baseline;
      margin-left: 6px;
      color: #5b6577;

      .header {
        font-size: 12px;
        line-height: 12px;
        margin-bottom: 3px;
      }

      .number {
        font-size: 20px;
        line-height: 20px;
      }
    }
  }
  .problemType {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90px;
    height: 24px;
    font-size: 14px;
    border-radius: 15px;
    color: #f4f5f7;
    margin: auto;
  }
</style>
