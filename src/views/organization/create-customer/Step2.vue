<template>
  <a-form layout="vertical" ref="formRef" :model="formState">
    <div style="margin-bottom: 24px; color: #818792">
      Note: The account information on this page will be used as the company’s administrator
      account.
    </div>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-form-item name="sex" required hasFeedback>
          <a-select placeholder="* Mr." v-model:value="formState.sex" :options="genders" />
        </a-form-item>
      </a-col>
      <a-col :span="16">
        <a-form-item name="contactName" required hasFeedback>
          <a-input v-model:value="formState.contactName" :maxlength="120" placeholder="* Name" />
        </a-form-item>
      </a-col>
    </a-row>
    <a-form-item name="email" required hasFeedback>
      <a-input v-model:value="formState.email" :maxlength="120" placeholder="* Email" />
    </a-form-item>
    <a-form-item name="position" hasFeedback>
      <a-input v-model:value="formState.position" :maxlength="40" placeholder="* Position" />
    </a-form-item>
    <a-form-item name="mobile" required hasFeedback>
      <a-input v-model:value="formState.mobile" :maxlength="16" placeholder="* Mob." />
    </a-form-item>
    <div style="margin-bottom: 24px; color: #818792">
      Default account password:
      <span style="color: #2c2d30; background-color: #ddd; border-radius: 10px"
        >&nbsp;Watt4freedom!&nbsp;</span
      >
      <Icon
        icon="copy|svg"
        style="margin-left: 10px; cursor: pointer"
        :size="1"
        @click="copyPwd"
      />
    </div>

    <div class="modal-footer-old">
      <a-button class="modal-cancel mr-4" @click="backFunc">Previous</a-button>
      <a-button class="modal-save" @click="doneFunc">Done</a-button>
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { genders } from '@/enums/appEnum';
  import Icon from '@/components/Icon/Icon.vue';
  import { copyText } from '@/utils/copyTextToClipboard';

  const emit = defineEmits(['submit', 'prev']);

  const formRef = ref();
  const { validForm } = useFormValid(formRef);
  const formState = reactive({
    sex: 1,
    contactName: '',
    email: '',
    position: '',
    mobile: '',
  });

  const copyPwd = () => {
    copyText('Watt4freedom!');
  };

  async function backFunc() {
    emit('prev');
  }

  async function doneFunc() {
    const data = await validForm();
    if (!data) return;
    emit('submit', { ...data });
  }
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
