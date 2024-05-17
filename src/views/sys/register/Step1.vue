<template>
  <a-form layout="vertical" ref="formRef" :model="formState" :rules="step1FormRules">
    <div class="create-plant-note" style="margin-bottom: 24px">
      Note: To complete your organization's registration, you will need an ID of your superior
      company; if you don't have one, please contact your superior company's administrator.
    </div>
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item name="companyCode" hasFeedback>
          <a-input
            v-model:value="formState.companyCode"
            placeholder="Company ID"
            :maxlength="6"
            @change="companyIDChangeHandler"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <div class="modal-footer-old">
      <a-button class="modal-cancel mr-4" @click="cancelFunc"> Cancel </a-button>
      <a-button class="modal-save" @click="submitFunc"> Next </a-button>
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import { OrganizationRegisterModel } from '#/store';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { getCountryNameWithCodeApi } from '/@/api/sys/user';

  const emit = defineEmits(['next', 'cancel']);
  const regex: RegExp = /^[0-9]{6}$/;

  const formRef = ref();
  const { validForm } = useFormValid(formRef);
  const formState = reactive<OrganizationRegisterModel>({
    parentId: '',
    companyCode: '',
  });

  const companyIDChangeHandler = async (val: { target: { value: string } }) => {
    console.log(val.target.value);
    const comId = (val.target.value as string).toLocaleUpperCase().replace(/[^\d]/g, '');
    console.log(comId);
    formState.companyCode = comId;
  };

  const validateComCode = () => {
    return async (_: any, value: string) => {
      if (!value) {
        return Promise.reject('Please input your company ID');
      }

      if (!regex.test(value)) {
        return Promise.reject('company ID format error');
      }
      const res = await getCountryNameWithCodeApi(value);
      formState.parentId = res.companyId;
    };
  };

  const step1FormRules = computed(() => ({
    companyCode: [{ validator: validateComCode(), trigger: 'change' }],
  }));

  function cancelFunc() {
    emit('cancel');
  }

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;
    const { parentId } = formState;
    emit('next', { parentId });
  }
</script>
