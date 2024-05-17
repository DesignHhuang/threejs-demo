<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :width="750"
    :mask-closable="false"
    title="Add device"
    @ok="handleOK"
    @cancel="afterClose"
    destroyOnClose
  >
    <a-form layout="vertical" ref="formRef" :model="formState" :rules="addDeviceFormRules">
      <div class="content-section">
        <div style="height: 16px; margin-bottom: 26px">
          <img :src="warn_grey" style="width: 16px; height: 16px" />
          Please check the filled in information carefully.
        </div>
        <a-form-item name="outerSn" hasFeedback>
          <a-input
            v-model:value="formState.outerSn"
            allowClear
            :maxlength="120"
            placeholder="* Device SN"
          />
        </a-form-item>
        <div class="createplant-product-style">
          <a-row :gutter="30" :key="product.productSn" v-for="product in products">
            <a-col :span="12">
              <a-input disabled :value="model" />
            </a-col>
            <a-col :span="12">
              <a-input disabled :value="product.productSn" />
            </a-col>
          </a-row>
        </div>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="subSysName" hasFeedback>
              <a-input
                :maxlength="20"
                v-model:value="formState.subSysName"
                placeholder="Device Name"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <!-- :rules="{ required: formState.outerSn !== '', message: 'Please enter check code' }" -->
            <a-form-item name="checkCode" hasFeedback>
              <a-input
                :maxlength="120"
                v-model:value="formState.checkCode"
                placeholder="* Check Code"
                @change="checkCodeChangeHandler"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </a-form>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { putProductBind, queryBatAllDevice } from '/@/api/wattspace/powerStation';
  import { useMessage } from '/@/hooks/web/useMessage';
  import warn_grey from '@/assets/icons/warn_grey.svg';
  import { useFormValid } from '/@/hooks/web/useFormValid';

  const plantID = ref();

  const formRef = ref();
  const { validForm } = useFormValid(formRef);
  const products = ref<any>([]);
  const model = ref('');
  const subSysId = ref('');
  const formState = reactive({
    outerSn: '',
    checkCode: '',
    subSysName: '',
  });

  const emit = defineEmits(['addDeviceSuccess', 'register']);

  const { createMessage } = useMessage();
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    console.log(data);
    plantID.value = data?.plantID;
    console.log(plantID.value);
  });

  const checkCodeChangeHandler = async (val) => {
    const checkCode = (val.target.value as string).toLocaleUpperCase().replace(/[^\d]/g, '');
    formState.checkCode = checkCode;
  };

  const validateOuterSn = () => {
    return async (_, value: string) => {
      if (!value) {
        model.value = '';
        products.value = [];
        return Promise.reject('Please enter Device SN');
      }
      const data = await queryBatAllDevice(value);
      if (!data.status) {
        model.value = '';
        subSysId.value = '';
        products.value = [];
        return Promise.reject(data.failedMessage);
      } else {
        subSysId.value = data.subSysId;
        model.value = data.model;
        products.value = data.productBriefVoList;
      }
      return Promise.resolve();
    };
  };

  const handleOK = async () => {
    // console.log(batIds.value);

    const data = await validForm();
    if (!data) return;

    if (!formState.outerSn) {
      createMessage.error('Please input device SN.');
      return;
    }
    // 先保存基本信息，后保存snlist(v3逻辑修改，基本信息与设备绑定分开)
    try {
      putProductBind({
        plantId: plantID.value,
        subSysParams: [
          {
            subSysId: subSysId.value,
            subSysName: formState.subSysName,
            outerSn: formState.outerSn,
            checkCode: formState.checkCode,
          },
        ],
      }).then((res) => {
        if (res) {
          formRef.value.resetFields();
          closeModal();
          createMessage.success('Add Device successful');
          emit('addDeviceSuccess');
        } else {
          createMessage.error('Add Device failed');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addDeviceFormRules = {
    outerSn: [{ validator: validateOuterSn(), trigger: 'blur' }],
    checkCode: [{ required: true }],
  };

  const afterClose = () => {
    formRef.value.resetFields();
  };
</script>

<style lang="less" scoped>
  .createplant-product-style {
    padding: 0 5px;
    margin-bottom: 29px;
    .ant-row {
      margin-bottom: 12px;
    }
  }
</style>
