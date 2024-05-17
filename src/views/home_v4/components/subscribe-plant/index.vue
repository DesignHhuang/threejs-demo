<template>
  <DeskModal
    v-bind="$attrs"
    padding="20px"
    :width="600"
    @register="registerModal"
    :title="value ? value.label : 'Add a tracking power plant'"
    :header-icon="subcribe_plant_v4"
    :help-message="'You can check the realtime status on the homepage after added.'"
    destroyOnClose
  >
    <template #footer>
      <div class="desk-modal-footer">
        <DeskButton :isIcon="true" px :icon="add_large_v4" @click="submit" />
      </div>
    </template>
    <a-select
      v-model:value="value"
      show-search
      allow-clear
      labelInValue
      :default-active-first-option="false"
      :show-arrow="false"
      :filter-option="false"
      style="width: 100%; margin-top: 1.25rem"
      :options="data"
      @search="handleSearch"
      @change="handleChange"
      placeholder="Search for Plant"
      popupClassName="search-res-list"
      size="large"
    >
    </a-select>
  </DeskModal>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { DeskModal, useModalInner } from '/@/components/DeskModal';
  import { useDebounceFn } from '@vueuse/core';
  import add_large_v4 from '@/assets/svg/add_large_v4.svg';
  import subcribe_plant_v4 from '@/assets/svg/subcribe_plant_v4.svg';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { searchByPlantName } from '/@/api/wattspace/powerStation';

  const emit = defineEmits(['register', 'cancel', 'subscribe-plant']);

  const props = defineProps({
    subscribedPlants: { type: Array, default: () => [] },
  });

  const [registerModal, { closeModal }] = useModalInner();
  const { createMessage } = useMessage();

  const data = ref<any[]>([]);
  const value = ref();

  async function search(value: string) {
    data.value = [];
    const keyword = value.trim();
    if (!value) {
      data.value = [];
      return;
    }
    const plants = await searchByPlantName({ plantName: keyword });
    data.value = plants.map((res) => ({ label: res.plantName, value: res.plantId }));
  }

  const handleSearch = useDebounceFn(search, 600);

  const handleChange = (val) => {
    console.log(val.option);
    value.value = val.option;
  };

  const submit = () => {
    const plantID = unref(value).value;
    // 如果电站已经添加过了，则给出无法重复添加的提示
    if (props.subscribedPlants.includes(plantID)) {
      createMessage.error('This plant has been subscribed to,Please select another one.');
      return;
    }
    // 添加关注的电站
    emit('subscribe-plant', plantID);
    value.value = null;
    closeModal();
  };
</script>

<style lang="less">
  .create-plant-note {
    color: #818792;
    font-size: 14px;
    font-weight: 400;
  }
</style>
