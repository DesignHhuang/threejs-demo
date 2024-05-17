<template>
  <a-form layout="vertical" ref="formRef" :model="formState" :rules="step4FormRules">
    <a-form-item name="outerSn">
      <a-input v-model:value="formState.outerSn" :maxlength="120" placeholder="* Device SN" />
    </a-form-item>

    <a-form-item
      v-if="shouldCheckCode"
      name="checkCode"
      :rules="{ required: formState.outerSn !== '', message: 'Please enter check code' }"
    >
      <a-input
        :maxlength="120"
        v-model:value="formState.checkCode"
        placeholder="* Check Code"
        @change="checkCodeChangeHandler"
      />
    </a-form-item>

    <a-form-item name="subSysName">
      <a-input :maxlength="20" v-model:value="formState.subSysName" placeholder="Device Name" />
    </a-form-item>

    <div class="createplant-product-style" v-if="showProducts">
      <div
        class="product-item font-14 color-b"
        :key="product.productSn"
        v-for="(product, index) in products"
      >
        <div class="id">{{ index + 1 }}</div>
        <div class="model">{{ model }}</div>
        <div class="productSn">{{ product.productSn }}</div>
      </div>
    </div>

    <div class="modal-footer">
      <DeskButton :isIcon="true" px :icon="previous_step_v4" @click="backFunc" />
      <DeskButton :isIcon="true" px :icon="btn_ok_v4" @click="doneFunc" />
      <!-- <a-button class="modal-cancel mr-4" @click="backFunc">Previous</a-button>
      <a-button class="modal-save" @click="doneFunc">{{ submitText }}</a-button> -->
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import { PlantInfo } from '#/store';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { queryBatAllDevice } from '/@/api/wattspace/powerStation';
  import previous_step_v4 from '@/assets/svg/previous_step_v4.svg';
  import btn_ok_v4 from '@/assets/svg/btn_ok_v4.svg';

  const emit = defineEmits(['submit', 'prev']);

  const formRef = ref();
  const shouldCheckCode = ref(false);
  const { validForm } = useFormValid(formRef);
  const products = ref<any>([]);
  const showProducts = computed(() => products.value && products.value.length > 0);
  const model = ref('');
  const subSysId = ref('');
  const formState = reactive<PlantInfo>({
    outerSn: '',
    checkCode: '',
    subSysName: '',
  });

  const validateOuterSn = () => {
    return async (_, value: string) => {
      if (!value) {
        model.value = '';
        products.value = [];
        return Promise.resolve();
      }
      const data = await queryBatAllDevice(value);
      shouldCheckCode.value = data.hasCheckCode;
      //子系统类型 0: 电池 1: 热水器
      if (data.type === 0 && formState.subSysName === '') {
        formState.subSysName = 'My BMS';
      }
      if (data.type === 1 && formState.subSysName === '') {
        formState.subSysName = 'My Heater';
      }
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

  const checkCodeChangeHandler = async (val) => {
    const checkCode = (val.target.value as string).toLocaleUpperCase().replace(/[^\d]/g, '');
    formState.checkCode = checkCode;
  };

  const step4FormRules = {
    outerSn: [{ validator: validateOuterSn(), trigger: 'change' }],
  };

  async function backFunc() {
    emit('prev');
  }

  async function doneFunc() {
    const data = await validForm();
    if (!data) return;
    emit('submit', {
      ...data,
      subSysId: subSysId.value,
      products: products.value,
      model: model.value,
    });
  }
</script>
<style lang="less" scoped>
  .createplant-product-style {
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    .product-item {
      display: flex;
      align-items: center;
      padding: 20px;
      height: 40px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);

      &:last-child {
        border-bottom: 0;
      }
      .id {
        width: 80px;
      }
      .model {
        width: 224px;
      }
    }
  }
</style>
