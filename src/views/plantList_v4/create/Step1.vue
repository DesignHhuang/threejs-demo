<template>
  <a-form layout="vertical" ref="formRef" :model="formState" :rules="step1FormRules">
    <a-form-item name="plantName">
      <a-input v-model:value="formState.plantName" :maxlength="120" placeholder="* Plant name" />
    </a-form-item>

    <div class="flex justify-between">
      <div class="step-1-left">
        <a-form-item name="region">
          <a-select
            v-model:value="formState.region"
            showSearch
            placeholder="* Country"
            :filter-option="filterOption"
            option-label-prop="children"
            ><template #suffixIcon>
              <Icon :size="2.5" icon="select_arrow_down_v4|svg" />
            </template>
            <a-select-option
              :key="`${country.localName} (${country.commonName})`"
              v-for="country in countries"
              :value="country.areaCode"
            >
              <div class="flex items-center">
                <img class="mr-2" :src="country.flag" width="20" />
                <div class="country-name" :title="`${country.localName} (${country.commonName})`">
                  {{ `${country.localName} (${country.commonName})` }}
                </div>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="timezone">
          <a-select
            placeholder="* Time zone"
            showSearch
            v-model:value="formState.timezone"
            :options="timezoneOptions"
            :field-names="{ label: 'value', value: 'key' }"
          >
            <template #suffixIcon>
              <Icon :size="2.5" icon="select_arrow_down_v4|svg" />
            </template>
          </a-select>
        </a-form-item>
      </div>
      <div>
        <Upload
          v-model:file-list="fileList"
          list-type="picture-card"
          class="plant-image-uploader"
          :customRequest="customUpload"
          :before-upload="beforeUpload"
          :show-upload-list="false"
        >
          <img v-if="imageUrl" style="height: 100%" :src="imageUrl" alt="avatar" />
          <div v-else class="flex items-center">
            <Icon :size="40" size-type="px" icon="add_v4|svg" />
            <span class="color-b-6 font-14">Plant picture</span>
          </div>
        </Upload>
      </div>
    </div>

    <a-form-item name="address">
      <GoogleMap
        ref="gmapRef"
        height="272px"
        @change-point="changePonit"
        @point-changed="pointChanged"
      />
    </a-form-item>
    <a-form-item name="installer">
      <a-tree-select
        v-model:value="formState.installer"
        show-search
        placeholder="* Installer company"
        tree-default-expand-all
        labelInValue
        :tree-data="installers"
        :fieldNames="{ label: 'name', value: 'id' }"
        tree-node-filter-prop="name"
      >
        <template #title="{ name }">
          {{ name }}
        </template>
        <template #suffixIcon>
          <Icon :size="2.5" icon="select_arrow_down_v4|svg" />
        </template>
      </a-tree-select>
    </a-form-item>
    <div class="modal-footer">
      <DeskButton :isIcon="true" px :icon="btn_cancel_v4" @click="cancelFunc" />
      <DeskButton :isIcon="true" px :icon="next_step_v4" @click="submitFunc" />
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { PlantInfo } from '#/store';
  import { useRequest } from 'vue-request';
  import { Upload } from 'ant-design-vue';
  import { getComTree, getTimeZone } from '@/api/wattspace/system';
  import { getCountryFlags } from '/@/api/wattspace/powerStation';
  import GoogleMap from '../components/map/Google.vue';
  import dayjs from 'dayjs';
  import timezone from 'dayjs/plugin/timezone';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { step1FormRules } from './useRules';
  import btn_cancel_v4 from '@/assets/svg/btn_cancel_v4.svg';
  import next_step_v4 from '@/assets/svg/next_step_v4.svg';
  //import add_v4 from '@/assets/svg/add_v4.svg';
  import Icon from '/@/components/Icon/Icon.vue';
  import { putObject } from '/@/utils/alioss';
  import { useMessage } from '/@/hooks/web/useMessage';
  import type { UploadProps } from 'ant-design-vue';

  dayjs.extend(timezone);

  const emit = defineEmits(['next', 'cancel']);

  const gmapRef = ref();
  const formRef = ref();
  const fileList = ref<UploadProps['fileList']>([]);
  const imageUrl = ref<string>('');

  const { createMessage } = useMessage();
  const { validForm } = useFormValid(formRef);
  const formState = reactive<PlantInfo>({
    plantName: '',
    region: null,
    timezone: null,
    address: '',
    longitude: 120.3,
    latitude: 31.5,
    plantPicture: 'desk-v4/plant-pic.png',
    installer: null,
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

  const { data: timezoneOptions } = useRequest(getTimeZone, {
    manual: false,
    onSuccess(data) {
      const currentZone = dayjs.tz.guess();
      data.map((zone) => {
        if (zone.key == currentZone) {
          formState.timezone = zone.key;
        }
      });
    },
  });

  function cancelFunc() {
    emit('cancel');
  }

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;
    const { longitude, latitude, plantPicture } = formState;
    emit('next', {
      ...data,
      longitude,
      latitude,
      plantPicture,
      installerId: data.installer.value,
      installerName: data.installer.label,
    });
  }

  const installers = ref<{ label: string; value: string }[]>();
  useRequest(getComTree, {
    manual: false,
    onSuccess: (data) => {
      installers.value = [data];
    },
  });

  const customUpload = async (e) => {
    const data = await putObject(e.file);
    const { status, fileUrl } = data;
    if (status === 'success') {
      formState.plantPicture = fileUrl;
      imageUrl.value = `http://oss.wattsonic.com/${fileUrl}`;
      fileList.value = [
        {
          uid: e.file.uid,
          name: e.file.name,
          status: 'done',
          url: 'imageUrl.value',
        },
      ];
    } else {
      formState.plantPicture = 'desk-v4/plant-pic.png';
      createMessage.error('Upload failed');
      fileList.value = [
        {
          uid: e.file.uid,
          name: e.file.name,
          status: 'error',
        },
      ];
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      console.log('You can only upload JPG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      console.log('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };
</script>
<style lang="less">
  .country-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .step-1-left {
    width: 340px;
  }
  .plant-image-uploader {
    width: 200px !important;

    .ant-upload {
      width: 100% !important;
      background-color: transparent !important;
      border-radius: 6px !important;
    }
  }
</style>
