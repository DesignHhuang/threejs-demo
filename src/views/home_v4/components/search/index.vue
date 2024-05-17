<template>
  <div class="home-search">
    <a-select
      :value="keyword"
      show-search
      :default-active-first-option="false"
      :show-arrow="false"
      :filter-option="false"
      style="width: 37.5rem"
      :options="data"
      @search="handleSearch"
      @change="handleChange"
      placeholder="Search for plant, distributor installer or SN"
      popupClassName="search-res-list"
    >
    </a-select>
    <div v-if="keyword" class="home-search-icon-cancel" @click="clearFilter">
      <img
        class="text-icon-img cursor-p"
        style="transform: rotate(45deg)"
        :src="add_v4"
        alt="add_v4"
      />
    </div>
    <div v-else class="home-search-icon">
      <Icon icon="search_v4|svg" style="color: #fff" :size="1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useDebounceFn } from '@vueuse/core';
  import { getSearchTips } from '@/api/wattspace/powerStation';
  import { union } from 'lodash-es';
  import Icon from '@/components/Icon/Icon.vue';
  import add_v4 from '@/assets/svg/add_v4.svg';

  defineProps({ keyword: { type: String } });
  const emit = defineEmits(['getPlantList', 'clearFilter']);

  const data = ref<any[]>([]);

  async function search(value: string) {
    data.value = [];

    const keyword = value.trim();
    if (!value) {
      data.value = [];
      return;
    }
    const { subMasterSns, plants, distributors, installers } = await getSearchTips(keyword);
    const distributorInstaller: string[] = union(distributors, installers);
    if (plants.length > 0) {
      data.value.push({
        label: 'POWER STATION',
        options: plants.map((res: string) => ({ value: res, label: res })),
      });
    }
    if (distributorInstaller.length > 0) {
      data.value.push({
        label: 'DISTRIBUTOR/INSTALLER',
        options: distributorInstaller.map((res) => ({ value: res, label: res })),
      });
    }
    if (subMasterSns.length > 0) {
      data.value.push({
        label: 'SERIAL NO.',
        options: subMasterSns.map((res: string) => ({ value: res, label: res })),
      });
    }
  }

  const handleSearch = useDebounceFn(search, 600);

  const handleChange = (val: string) => {
    emit('getPlantList', { keyword: val });
  };

  const clearFilter = () => {
    emit('clearFilter');
  };
</script>
<style lang="less">
  .home-search-icon-cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    margin: 0.375rem;
    position: absolute;
    right: 0;

    &:hover {
      background: rgba(0, 0, 0);
    }
  }
  .home-search {
    position: relative;
    display: flex;
    align-items: center;
    .plant_search_icon {
      position: absolute;
      left: 16px;
      z-index: 1;
    }
    .ant-select .ant-select-clear {
      background: unset;
    }

    .ant-select-single .ant-select-selector {
      display: flex;
      align-items: center;
      border-radius: 0.625rem;
      height: 2.5rem;
      box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.15);

      .ant-select-selection-search {
        inset-inline-start: 1.25rem;
        inset-inline-end: 2.5rem;
      }
    }

    .ant-select-single .ant-select-selector .ant-select-selection-item,
    .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
      line-height: 2.5rem;
    }

    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
      background-color: rgba(246, 246, 246, 0.36);
      border: 1px solid #ffffff;
      padding: 0 0 0 1.25rem;
      backdrop-filter: blur(40px);
    }

    .ant-select-single:not(.ant-select-customize-input)
      .ant-select-selector
      .ant-select-selection-search-input {
      height: 2.5rem;
    }
  }
  .search-res-list {
    border-radius: 1.25rem;
    border: 1px solid rgba(26, 26, 26, 0.46);
    background: rgba(246, 246, 246, 0.36);
    box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(40px);

    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
      background-color: #5b657747;
    }
  }
</style>
