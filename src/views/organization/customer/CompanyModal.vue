<template>
  <BasicModal
    v-bind="$attrs"
    :width="660"
    :footer="null"
    @register="registerModal"
    title="Company info"
  >
    <a-form layout="vertical" ref="formRef" :model="formState">
      <a-form-item name="companyName" required hasFeedback>
        <a-input
          v-model:value="formState.companyName"
          :maxlength="150"
          placeholder="* Company name"
        />
      </a-form-item>
      <a-form-item name="website" required hasFeedback>
        <a-input v-model:value="formState.website" :maxlength="150" placeholder="* Website" />
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
        <a-button class="modal-cancel mr-4" @click="closeModal"> Cancel </a-button>
        <a-button class="modal-save" @click="submitFunc"> Done </a-button>
      </div>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { useRequest } from 'vue-request';
  import { getCountryFlags } from '/@/api/wattspace/powerStation';
  import GoogleMap from '../../plantList_v4/components/map/Google.vue';
  import { updateCompany, updateSubCompany } from '/@/api/wattspace/system';

  const emit = defineEmits(['success', 'register']);
  const isUpdateCurrentCompany = ref(false); // 是否是更新当前用户的公司
  const companyId = ref();

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

  const [registerModal, { closeModal }] = useModalInner((data) => {
    isUpdateCurrentCompany.value = data.isUpdateCurrentCompany;
    companyId.value = data.companyInfo.companyId;
    formState.companyName = data.companyInfo.companyName;
    formState.website = data.companyInfo.website;
    formState.region = data.companyInfo.region;
    formState.address = data.companyInfo.address;
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

  const { run: editCurrentCompany } = useRequest(updateCompany, {
    onSuccess: (_) => {
      closeModal();
      emit('success');
    },
  });

  const { run: editCompany } = useRequest(updateSubCompany, {
    onSuccess: (_) => {
      closeModal();
      emit('success');
    },
  });

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;
    console.log(data);
    isUpdateCurrentCompany.value
      ? editCurrentCompany(data)
      : editCompany({ ...data, companyId: companyId.value });
  }
</script>
