<template>
  <a-form layout="vertical" ref="formRef" :model="formState">
    <a-form-item name="companyName" required hasFeedback>
      <a-input
        v-model:value="formState.companyName"
        :maxlength="120"
        placeholder="* Company name"
      />
    </a-form-item>
    <a-form-item name="website" required hasFeedback>
      <a-input v-model:value="formState.website" :maxlength="120" placeholder="* Website" />
    </a-form-item>
    <a-form-item name="region" required hasFeedback>
      <a-select
        v-model:value="formState.region"
        showSearch
        placeholder="* Country"
        :filter-option="filterOption"
        option-label-prop="children"
      >
        <a-select-option
          :key="`${country.localName} (${country.commonName})`"
          v-for="country in countries"
          :value="country.areaCode"
        >
          <div class="flex items-center">
            <img class="mr-2" :src="country.flag" width="20" />
            <div :title="`${country.localName} (${country.commonName})`">
              {{ `${country.localName} (${country.commonName})` }}
            </div>
          </div>
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item name="address" required hasFeedback>
      <GoogleMap
        ref="gmapRef"
        height="280px"
        @change-point="changePonit"
        @point-changed="pointChanged"
      />
    </a-form-item>
    <div class="modal-footer-old">
      <a-button class="modal-cancel mr-4" @click="cancelFunc"> Cancel </a-button>
      <a-button class="modal-save" @click="submitFunc"> Next </a-button>
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { useRequest } from 'vue-request';
  import { getCountryFlags } from '/@/api/wattspace/powerStation';
  import GoogleMap from '../../plantList_v4/components/map/Google.vue';
  import { useFormValid } from '/@/hooks/web/useFormValid';

  const emit = defineEmits(['next', 'cancel']);

  const gmapRef = ref();
  const formRef = ref();
  const { validForm } = useFormValid(formRef);
  const formState = reactive({
    companyName: '',
    website: '',
    region: null,
    address: '',
    longitude: 120.3,
    latitude: 31.5,
  });

  const changePonit = (value) => {
    formState.longitude = value.lng;
    formState.latitude = value.lat;
  };

  const pointChanged = (value) => {
    formState.address = value;
    formRef.value.validate('address');
  };

  const filterOption = (input: string, option: any) => {
    return option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const { data: countries } = useRequest(getCountryFlags, {
    manual: false,
  });

  function cancelFunc() {
    emit('cancel');
  }

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;
    const { longitude, latitude } = formState;
    emit('next', { ...data, longitude, latitude });
  }
</script>
