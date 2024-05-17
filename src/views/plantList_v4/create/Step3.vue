<template>
  <a-form layout="vertical" ref="formRef" :model="formState">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-form-item name="localCurrency" required>
          <a-select
            showSearch
            placeholder="* Currency"
            :field-names="{ label: 'value', value: 'key' }"
            v-model:value="formState.localCurrency"
            :options="data"
          />
        </a-form-item>
      </a-col>
      <a-col :span="16">
        <a-form-item name="gridPricePerKWh" required>
          <a-input-number
            class="w-full"
            v-model:value="formState.gridPricePerKWh"
            :min="0"
            :precision="4"
            placeholder="* Price per kWh"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <div class="modal-footer">
      <DeskButton :isIcon="true" px :icon="previous_step_v4" @click="backFunc" />
      <DeskButton :isIcon="true" px :icon="next_step_v4" @click="submitFunc" />
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { PlantInfo } from '#/store';
  import { InputNumber } from 'ant-design-vue';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { useRequest } from 'vue-request';
  import { getDictionary } from '/@/api/wattspace/system';
  import previous_step_v4 from '@/assets/svg/previous_step_v4.svg';
  import next_step_v4 from '@/assets/svg/next_step_v4.svg';

  const AInputNumber = InputNumber;

  const emit = defineEmits(['next', 'prev']);

  const formRef = ref();
  const { validForm } = useFormValid(formRef);
  const formState = reactive<PlantInfo>({
    localCurrency: 'USD',
    gridPricePerKWh: 0,
  });

  async function backFunc() {
    emit('prev');
  }

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;

    emit('next', data);
  }

  const { data } = useRequest(getDictionary, {
    manual: false,
    defaultParams: ['CURRENCY'],
  });
</script>
