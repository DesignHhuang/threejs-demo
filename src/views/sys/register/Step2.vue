<template>
  <a-form layout="vertical" ref="formRef" :model="formState" :rules="step2FormRules">
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item name="companyName" hasFeedback>
          <a-input
            v-model:value="formState.companyName"
            placeholder="Company Name"
            :maxlength="128"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item name="region" hasFeedback>
          <a-select
            v-model:value="formState.region"
            showSearch
            placeholder="Select a Country"
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
      </a-col>
    </a-row>

    <a-form-item name="address" hasFeedback>
      <GoogleMap
        ref="gmapRef"
        height="280px"
        @change-point="changePonit"
        @point-changed="pointChanged"
      />
    </a-form-item>

    <div class="modal-footer-old">
      <a-button class="modal-cancel mr-4" @click="backFunc">Previous</a-button>
      <a-button class="modal-save" @click="submitFunc">Next</a-button>
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed } from 'vue';
  import { OrganizationRegisterModel } from '#/store';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { getCountryFlags } from '/@/api/wattspace/powerStation';
  import { useRequest } from 'vue-request';
  import GoogleMap from '../../plantList_v4/components/map/Google.vue';

  const { t } = useI18n();

  const emit = defineEmits(['next', 'prev']);

  const gmapRef = ref();
  const formRef = ref();
  const { validForm } = useFormValid(formRef);

  const filterOption = (input: string, option: any) => {
    return option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const { data: countries } = useRequest(getCountryFlags, {
    manual: false,
  });

  const formState = reactive<OrganizationRegisterModel>({
    companyName: '',
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

  const step2FormRules = computed(() => ({
    companyName: [{ required: true, message: t('sys.register.companyNamePlaceholder') }],
    region: [{ required: true, message: t('sys.register.countryPlaceholder') }],
    address: [{ required: true, message: t('sys.register.addressPlaceholder') }],
  }));

  async function backFunc() {
    emit('prev');
  }

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;
    const { longitude, latitude } = formState;
    emit('next', { ...data, longitude, latitude });
  }
</script>
