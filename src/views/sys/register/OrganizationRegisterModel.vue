<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :width="660"
    :mask-closable="false"
    :footer="null"
    title="Organization register"
    destroyOnClose
    @cancel="handleCancel"
  >
    <WattSteps :current="current" :stepWidth="200" :steps="steps" />

    <div class="mt-5">
      <Step1 @cancel="closeModal" @next="handleStep1Next" v-show="current === 0" />
      <Step2
        @prev="handleStepPrev"
        @next="handleStep2Next"
        v-show="current === 1"
        v-if="state.initStep2"
      />
      <Step3
        v-show="current === 2"
        @prev="handleStepPrev"
        @submit="handleSubmit"
        v-if="state.initStep3"
      />
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { WattSteps } from '/@/components/WattSteps';
  import { useUserStore } from '/@/store/modules/user';
  import Step1 from './Step1.vue';
  import Step2 from './Step2.vue';
  import Step3 from './Step3.vue';

  import { useMessage } from '/@/hooks/web/useMessage';

  const userStore = useUserStore();

  const emit = defineEmits(['addSuccess', 'register', 'cancel']);

  const [registerModal, { closeModal }] = useModalInner();
  const { createMessage } = useMessage();

  const current = ref(0);
  const step1Values = ref();
  const step2Values = ref();
  const steps = [
    { title: 'Superior Company' },
    { title: 'Your Company Info' },
    { title: 'Your Info' },
  ];

  const state = reactive({
    initStep2: false,
    initStep3: false,
  });

  function handleStepPrev() {
    current.value--;
  }

  function handleStep1Next(values: any) {
    current.value++;
    state.initStep2 = true;
    step1Values.value = values;
  }

  function handleStep2Next(values: any) {
    current.value++;
    state.initStep3 = true;
    step2Values.value = values;
  }

  function handleSubmit(values: any) {
    const sendData = {
      ...step1Values.value,
      ...step2Values.value,
      ...values,
    };
    console.log(sendData);
    try {
      userStore.organizeRegister(sendData).then((res) => {
        console.log(res);
        if (res) {
          closeModal();
          createMessage.success('organization register successful');
          emit('addSuccess');
        } else {
          createMessage.error('organization register failed');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  const handleCancel = () => {
    current.value = 0;
    emit('cancel');
  };
</script>

<style lang="less">
  .create-plant-note {
    color: #818792;
    font-size: 14px;
    font-weight: 400;
  }
</style>
