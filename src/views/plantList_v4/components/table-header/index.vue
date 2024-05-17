<template>
  <div class="plant-list-table-header">
    <div class="subscribe"></div>
    <div
      :class="[
        `${header.id} header-${header.id}`,
        { 'header-active': header.active || header.filter },
      ]"
      :key="header.id"
      v-for="header in useFilters.getPlantListHeaders"
      @click.stop="setActive(header.id, header.active, header.type)"
    >
      <Icon :icon="header.icon" size="26" size-type="px" />
      <div class="title">{{ header.name }}</div>

      <div
        v-on-click-outside.bubble="handleClickOutside"
        v-if="header.active && header.type === 'select'"
        class="filter-wrapper"
      >
        <div v-if="header.id === 'com'">
          <div
            class="select-item select-all-icon"
            :class="{ selected: header.filter === null }"
            @click.stop="setFilter(header.id, null)"
          >
            All
          </div>
          <div
            class="select-item"
            :class="{ selected: computeSelected(header.filter, 1) }"
            @click.stop="setFilter(header.id, 1)"
          >
            <img class="select-item-icon" :src="online_v4" alt="comstatus_v4" />
            <span>Online</span>
          </div>
          <div
            class="select-item"
            :class="{ selected: computeSelected(header.filter, 2) }"
            @click.stop="setFilter(header.id, 2)"
          >
            <img class="select-item-icon" :src="comstatus_partially_v4" alt="comstatus_v4" />
            <span>Partially offline</span>
          </div>
          <div
            class="select-item"
            :class="{ selected: computeSelected(header.filter, 0) }"
            @click.stop="setFilter(header.id, 0)"
          >
            <img class="select-item-icon" :src="offline_v4" alt="comstatus_v4" />
            <span>Offline</span>
          </div>
          <div
            class="select-item"
            :class="{ selected: computeSelected(header.filter, -1) }"
            @click.stop="setFilter(header.id, -1)"
          >
            <img class="select-item-icon" :src="device_unbound_v4" alt="comstatus_v4" />
            <span>Unbound device</span>
          </div>
        </div>
        <div v-if="header.id === 'type'">
          <div
            class="select-item select-all"
            :class="{ selected: header.filter === null }"
            @click.stop="setFilter(header.id, null)"
          >
            All
          </div>
          <div
            class="select-item select-item-pl"
            :class="{ selected: computeSelected(header.filter, 1) }"
            @click.stop="setFilter(header.id, 1)"
          >
            <span>Heating System</span>
          </div>
          <div
            class="select-item select-item-pl"
            :class="{ selected: computeSelected(header.filter, 2) }"
            @click.stop="setFilter(header.id, 2)"
          >
            <span>Battery System</span>
          </div>
          <div
            class="select-item select-item-pl"
            :class="{ selected: computeSelected(header.filter, 3) }"
            @click.stop="setFilter(header.id, 3)"
          >
            <span>Hybrid System</span>
          </div>
        </div>
        <div v-if="header.id === 'device'">
          <div
            class="select-item select-all"
            :class="{ selected: header.filter === null }"
            @click.stop="setFilter(header.id, null)"
          >
            All
          </div>
          <div
            class="select-item select-item-pl"
            :class="{ selected: computeSelected(header.filter, 'BMS') }"
            @click.stop="setFilter(header.id, 'BMS')"
          >
            <span>BMS</span>
          </div>
          <div
            class="select-item select-item-pl"
            :class="{ selected: computeSelected(header.filter, 'BMS/Heater') }"
            @click.stop="setFilter(header.id, 'BMS/Heater')"
          >
            <span>BMS/Heater</span>
          </div>
          <div
            class="select-item select-item-pl"
            :class="{ selected: computeSelected(header.filter, 'Heater') }"
            @click.stop="setFilter(header.id, 'Heater')"
          >
            <span>Heater</span>
          </div>
        </div>
        <div v-if="header.id === 'status'">
          <div
            class="select-item select-all-icon"
            :class="{ selected: header.filter === null }"
            @click.stop="setFilter(header.id, null)"
          >
            All
          </div>
          <div
            class="select-item"
            :class="{ selected: computeSelected(header.filter, 0) }"
            @click.stop="setFilter(header.id, 0)"
          >
            <img class="select-item-icon" :src="plant_list_normal_v4" alt="running-status" />
            <span>Normal</span>
          </div>
          <div
            class="select-item"
            :class="{ selected: computeSelected(header.filter, 1) }"
            @click.stop="setFilter(header.id, 1)"
          >
            <img class="select-item-icon" :src="plant_list_attention_v4" alt="running-status" />
            <span>Attention</span>
          </div>
          <!-- <div class="select-item" @click.stop="setFilter(header.id, null)">
            <img class="w-h-26 select-item-icon" :src="plant_list_no_v4" alt="running-status" />
            <span class="font-b-14-500">--</span>
          </div> -->
        </div>
      </div>

      <div v-if="header.type === 'sort' && sortOrder" class="sort-wrapper">
        <Icon
          style="margin-bottom: -8px"
          size="16"
          size-type="px"
          :color="sortOrder === 'ascend' ? '#000000' : '#808080'"
          icon="prime:sort-up-fill"
        />
        <Icon
          size="16"
          size-type="px"
          :color="sortOrder === 'ascend' ? '#808080' : '#000000'"
          icon="prime:sort-down-fill"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import offline_v4 from '@/assets/svg/offline_v4.svg';
  import online_v4 from '@/assets/svg/online_v4.svg';
  import comstatus_partially_v4 from '@/assets/svg/comstatus_partially_v4.svg';
  import device_unbound_v4 from '@/assets/svg/device_unbound_v4.svg';
  import plant_list_normal_v4 from '@/assets/svg/plant_list_normal_v4.svg';
  import plant_list_attention_v4 from '@/assets/svg/plant_list_attention_v4.svg';
  import { useFilterStore } from '/@/store/modules/filters';
  import { vOnClickOutside } from '@vueuse/components';

  const emit = defineEmits(['filter-action']);

  const useFilters = useFilterStore();

  const sort = ref(''); // ascend descend
  const sortOrder = computed(
    () => useFilters.getPlantListHeaders.find((res) => res.id === 'update').filter,
  );

  const doFilter = () => {
    // 根据header 的状态最终确定filters  参数为排序的值
    useFilters.setPlantListFilters(sort.value);
    emit('filter-action');
  };

  const setFilter = (type, status) => {
    // 根据新的条件计算header中新的filter属性值
    useFilters.computedPlantListFilter(type, status);
    doFilter();
  };

  const computeSelected = (filters, status) => (filters ? filters.includes(status) : false);

  const isOfflineSelected = computed(() => {
    const row = useFilters.getPlantListHeaders.find((res) => res.id === 'com');
    if (row) {
      let filter: any = row?.filter;
      return filter ? filter.includes(0) : false;
    } else {
      return false;
    }
  });

  const isAttentionSelected = computed(() => {
    const row = useFilters.getPlantListHeaders.find((res) => res.id === 'status');
    if (row) {
      let filter: any = row?.filter;
      return filter ? filter.includes(1) : false;
    } else {
      return false;
    }
  });

  const setActive = (id: string, active: boolean, type: string) => {
    if (type === '') return;
    if (type === 'sort') {
      if (!sortOrder.value) {
        sort.value = 'ascend';
        useFilters.updateTableHeaderRecord(id, { active: true, filter: 'ascend' });
      } else if (sortOrder.value === 'ascend') {
        sort.value = 'descend';
        useFilters.updateTableHeaderRecord(id, { active: true, filter: 'descend' });
      } else {
        sort.value = '';
        useFilters.updateTableHeaderRecord(id, { active: false, filter: '' });
      }
      doFilter();
    } else {
      useFilters.updateTableHeaderRecord(id, { active: !active });
    }
  };

  const handleClickOutside = () => {
    useFilters.updateTableHeaderRecord('com', { active: false });
    useFilters.updateTableHeaderRecord('type', { active: false });
    useFilters.updateTableHeaderRecord('device', { active: false });
    useFilters.updateTableHeaderRecord('status', { active: false });
  };

  defineExpose({ isOfflineSelected, isAttentionSelected, setFilter });
</script>

<style lang="less" scoped>
  .header-active {
    color: #000000 !important;
    background: rgba(0, 0, 0, 0.2);
  }
  .filter-wrapper {
    position: absolute;
    background: #f6f6f6;
    min-height: 40px;
    width: 100%;
    border-radius: 10px;
    padding: 8px 10px;
    border: 1px solid #ffffff;
    top: 46px;
  }
  .sort-wrapper {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 2.5rem;
  }
  .select-item {
    margin: 2px 0;
    height: 36px;
    display: flex;
    align-items: center;
    border-radius: 5px;
    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  }
  .select-item-pl,
  .select-all {
    padding-left: 30px;
  }
  .select-all-icon {
    padding-left: 46px;
  }
  .select-item-icon {
    width: 26px;
    height: 26px;
    margin: 10px;
  }
  .selected {
    background: rgba(0, 0, 0, 0.2);
  }
</style>
