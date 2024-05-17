<template>
  <BasicModal
    v-bind="$attrs"
    :width="660"
    @register="registerModal"
    title="Copy and forward"
    :footer="null"
    :afterClose="afterClose"
  >
    <div class="copy">
      <div> Company Name: {{ formState.companyName }} </div>
      <div> Company ID: {{ formState.companyCode }} </div>
      <div> Company Administor Name: {{ formState.name }} </div>
      <div> Administor Email: {{ formState.email }} </div>

      <div v-if="showAfterAddCompany">
        <div> {{ adminPwd }} </div>
        <div>{{ loginUrl }}</div>
      </div>
      <div v-else>
        <div v-if="formState.position"> Position: {{ formState.position }} </div>
        <div> Mob: {{ formState.mob }}</div>
      </div>
    </div>
    <div class="modal-footer-old">
      <a-button class="modal-save" @click="handleSubmit">Copy</a-button>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { copyText } from '@/utils/copyTextToClipboard';

  const emit = defineEmits(['copySuccess', 'afterClose', 'register']);

  const afterClose = () => {
    emit('afterClose');
  };

  const formState = reactive({
    companyName: '',
    website: '',
    companyCode: '',
    name: '',
    email: '',
    position: '',
    mob: '',
  });

  const showAfterAddCompany = ref();
  const adminPwd = 'Administor Default Password: Watt4freedom!';
  const loginUrl = 'Login: https://www.wattdesk.com';

  const [registerModal, { closeModal }] = useModalInner((data) => {
    formState.companyCode = data.companyInfo.companyCode;
    formState.companyName = data.companyInfo.companyName;
    formState.website = data.companyInfo.website;
    formState.name = data.adminInfo.name;
    formState.email = data.adminInfo.email;
    formState.position = data.adminInfo.position;
    formState.mob = data.adminInfo.mobile;
    showAfterAddCompany.value = data.showAfterAddCompany;
  });

  const handleSubmit = () => {
    const comName = `Company Name: ${formState.companyName}\n`;
    const comID = `Company ID: ${formState.companyCode}\n`;
    const adminName = `Company Administor Name: ${formState.name}\n`;
    const adminEmail = `Administor Email: ${formState.email}\n`;
    const posi = `Position: ${formState.position}\n`;
    const mob = `Mob: ${formState.mob}`;

    const commonCopy = comName + comID + adminName + adminEmail;
    const otherCopy = showAfterAddCompany.value ? `${adminPwd}\n${loginUrl}` : posi + mob;

    copyText(commonCopy + otherCopy);
    closeModal();
  };
</script>
<style lang="less" scoped>
  .copy {
    color: #2c2d30;
    font-size: 18px;
    font-weight: 400;
  }
</style>
