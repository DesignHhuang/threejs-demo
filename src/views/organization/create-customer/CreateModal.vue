<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :width="660"
    :mask-closable="false"
    :footer="null"
    title="Add a new customer"
    destroyOnClose
    @cancel="handleCancel"
  >
    <WattSteps :current="current" :stepWidth="240" :steps="steps" />

    <div class="mt-5">
      <Step1 @cancel="closeModal" @next="handleStep1Next" v-show="current === 0" />
      <Step2
        v-show="current === 1"
        @prev="handleStepPrev"
        @submit="handleSubmit"
        v-if="state.initStep2"
      />
    </div>
  </BasicModal>
  <CopyModal @register="copyModal" @copy-success="copySuccess" @after-close="closeCopyModal" />
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { WattSteps } from '/@/components/WattSteps';
  import { useMessage } from '/@/hooks/web/useMessage';
  import Step1 from './Step1.vue';
  import Step2 from './Step2.vue';
  import { addCompany } from '/@/api/wattspace/system';
  import CopyModal from '../customer/CopyModal.vue';

  const emit = defineEmits(['addSuccess', 'register', 'cancel']);

  const [registerModal, { closeModal }] = useModalInner();
  const [copyModal, { openModal: openCopyModal }] = useModal();
  const { createMessage } = useMessage();

  const current = ref(0);
  const step1Values = ref();
  const steps = [{ title: 'Company Info' }, { title: 'Contact Info' }];

  const state = reactive({
    initStep2: false,
  });

  function handleStepPrev() {
    current.value--;
  }

  function handleStep1Next(values: any) {
    current.value++;
    state.initStep2 = true;
    step1Values.value = values;
  }

  const handleCancel = () => {
    current.value = 0;
    emit('cancel');
  };

  function handleSubmit(values: any) {
    const sendData = {
      ...step1Values.value,
      ...values,
    };
    try {
      addCompany(sendData).then((res) => {
        console.log(res.commonCode);
        if (res) {
          closeModal();
          createMessage.success('Add customer successful');
          current.value = 0;

          showCopyModal({ ...sendData, companyCode: res });
          // emit('addSuccess');
        } else {
          createMessage.error('Add customer failed');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  const showCopyModal = (values) => {
    console.log({ ...values });
    openCopyModal(true, {
      companyInfo: {
        companyCode: values.companyCode,
        companyName: values.companyName,
        website: values.website,
      },
      adminInfo: {
        name: values.contactName,
        email: values.email,
        position: values.position,
        mobile: values.mobile,
      },
      showAfterAddCompany: true,
    });
  };

  const closeCopyModal = () => {
    emit('addSuccess');
  };

  const copySuccess = () => {
    console.log('copySuccess');
    emit('addSuccess');
  };
</script>
