<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :width="750"
    :mask-closable="false"
    title=""
    @ok="handleOK"
    destroyOnClose
  >
    <a-form layout="vertical" ref="formRef" :model="formState">
      <div class="content-section">
        <div style="height: 20px; margin-bottom: 30px; display: flex; align-items: center">
          <img :src="plant_info_edit" style="width: 16px; height: 16px; margin-right: 10px" />
          <span style="font-size: 20px; font-weight: 600">Plant Info</span>
        </div>
        <div class="content-form">
          <a-form-item name="timezone" hasFeedback>
            <a-select
              :placeholder="t('common.chooseText')"
              showSearch
              v-model:value="formState.timezone"
              :options="timezoneOptions"
              :field-names="{ label: 'value', value: 'key' }"
            />
          </a-form-item>
        </div>
      </div>
    </a-form>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import plant_info_edit from '@/assets/icons/plant_info_edit.svg';
  import { useI18n } from 'vue-i18n';
  import { getTimeZone } from '/@/api/wattspace/system';
  import { useRequest } from 'vue-request';
  import { modifyTimeZone } from '/@/api/wattspace/powerStation';

  const { t } = useI18n();

  const plantID = ref();

  const emit = defineEmits(['editPlantInfoSuccess', 'register']);
  const formRef = ref();
  const formState = reactive({
    timezone: null,
  });

  const { data: timezoneOptions } = useRequest(getTimeZone, {
    manual: false,
  });

  const { createMessage } = useMessage();
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    console.log(data);
    plantID.value = data?.plantID;
    console.log(plantID.value);
    console.log(data.currentZone);
    formState.timezone = data.currentZone;
  });

  const handleOK = async () => {
    console.log(formState.timezone);

    if (!formState.timezone) {
      createMessage.error('Please select timezone.');
      return;
    }
    try {
      modifyTimeZone({
        plantId: plantID.value,
        timezone: formState.timezone,
      }).then((res) => {
        if (res) {
          formRef.value.resetFields();
          closeModal();
          createMessage.success('Edit Plant Info successful');
          emit('editPlantInfoSuccess');
        } else {
          createMessage.error('Edit Plant Info failed');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
</script>

<style lang="less">
  // @import url('../../create/index.less');
</style>
