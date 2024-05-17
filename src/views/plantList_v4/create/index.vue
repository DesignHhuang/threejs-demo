<template>
  <DeskModal
    v-bind="$attrs"
    @register="registerModal"
    :width="640"
    height="800px"
    :mask-closable="false"
    :footer="null"
    :title="title"
    :headerIcon="add_plant_v4"
    :help-message="helpMessage"
    destroyOnClose
    @cancel="handleCancel"
  >
    <template #steps v-if="!success">
      <WattSteps :current="current" :stepWidth="140" :steps="steps" />
    </template>
    <div class="add-success-con" v-if="success">
      <div class="plantInfo-item">
        <div class="left">
          <Icon icon="create_plant_icon1_v4|svg" :size="40" size-type="px" />
          <div class="font-14 color-b">Plant info</div>
        </div>
        <div class="plantInfoDetail font-14 color-b">
          <div>{{ successData.plantName }}</div>
          <div>{{ successData.region }}, {{ successData.timezone }}</div>
          <div>{{ successData.address }}</div>
          <div class="font-14 color-b">{{ successData.installerName }}</div>
        </div>
      </div>
      <div class="plantInfo-item">
        <div class="left">
          <Icon icon="create_plant_icon2_v4|svg" :size="40" size-type="px" style="color: '#000'" />
          <div class="font-14 color-b">Owner info</div>
        </div>
        <div class="plantInfoDetail font-14 color-b">
          <div>{{ gender }} {{ successData.ownerName }}</div>
          <div class="flex items-center">
            {{ successData.email }}
            <div class="ml-4 mr-4">{{ successData.password }}</div>
            <Icon
              title="Copy"
              class="copy-email"
              icon="solar:copy-bold"
              size="16"
              size-type="px"
              @click="copyEmail(successData.email, successData.password)"
            />
          </div>
          <div>{{ successData.mobile }}</div>
        </div>
      </div>
      <div class="plantInfo-item">
        <div class="left">
          <Icon icon="create_plant_icon3_v4|svg" :size="40" size-type="px" style="color: '#000'" />
          <div class="font-14 color-b">Electricity price</div>
        </div>
        <div class="plantInfoDetail font-14 color-b">
          {{ successData.gridPricePerKWh }} {{ successData.localCurrency }} per kWh
        </div>
      </div>
      <div class="plantInfo-item" v-if="successData.subSysParams.length > 0">
        <div class="left">
          <Icon icon="create_plant_icon4_v4|svg" :size="40" size-type="px" style="color: '#000'" />
          <div class="font-14 color-b">Devices</div>
        </div>
        <div class="plantInfoDetail font-14 color-b">
          <div :key="subSys.subSysId" v-for="subSys in successData.subSysParams">
            <div :key="product.productSn" v-for="product in subSys.products">
              <span>{{ product.productSn }}</span>
              <span class="ml-40-px">{{ successData.subSysParams[0].model }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <DeskButton :isIcon="true" px :icon="btn_cancel_v4" @click="handleCancel" />
      </div>
    </div>
    <div v-if="!success">
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
        @next="handleStep3Next"
        v-if="state.initStep3"
      />
      <Step4
        v-show="current === 3"
        @prev="handleStepPrev"
        @submit="handleSubmit"
        v-if="state.initStep4"
      />
    </div>
  </DeskModal>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import { DeskModal, useModalInner } from '/@/components/DeskModal';
  import { WattSteps } from '/@/components/WattSteps';
  import Step1 from './Step1.vue';
  import Step2 from './Step2.vue';
  import Step3 from './Step3.vue';
  import Step4 from './Step4.vue';
  import { addPlant } from '/@/api/wattspace/powerStation';
  import { useMessage } from '/@/hooks/web/useMessage';
  import add_plant_v4 from '@/assets/svg/add_plant_v4.svg';
  import Icon from '@/components/Icon/Icon.vue';
  import icon1 from '@/assets/svg/create_plant_icon1_v4.svg';
  import icon2 from '@/assets/svg/create_plant_icon2_v4.svg';
  import icon3 from '@/assets/svg/create_plant_icon3_v4.svg';
  import icon4 from '@/assets/svg/create_plant_icon4_v4.svg';
  import btn_cancel_v4 from '@/assets/svg/btn_cancel_v4.svg';
  import { genders } from '@/enums/appEnum';
  import { copyText } from '/@/utils/copyTextToClipboard';

  const emit = defineEmits(['addSuccess', 'register', 'cancel']);

  const [registerModal, { closeModal }] = useModalInner();
  const { createMessage } = useMessage();

  const current = ref(0);
  const success = ref(false);
  const title = computed(() => (success.value ? 'New plant added successful' : 'Add a new plant'));
  const helpMessage = computed(() => {
    return success.value
      ? ''
      : 'Note: It may take some time for the system to initialize and start collecting data from the new plant. Once the plant is successfully added, you can access its monitoring dashboard to view real-time data and performance metrics.';
  });

  const step1Values = ref();
  const step2Values = ref();
  const step3Values = ref();
  const steps = [
    { title: 'Plant Info', icon: 'create_plant_icon1_v4|svg', activeIcon: icon1 },
    { title: 'Owner Info', icon: 'create_plant_icon2_v4|svg', activeIcon: icon2 },
    { title: 'Electricity Price', icon: 'create_plant_icon3_v4|svg', activeIcon: icon3 },
    { title: 'Add Device', icon: 'create_plant_icon4_v4|svg', activeIcon: icon4 },
  ];

  const state = reactive({
    initStep2: false,
    initStep3: false,
    initStep4: false,
  });

  function handleStepPrev() {
    current.value--;
  }

  function handleStep1Next(values: any) {
    current.value++;
    state.initStep2 = true;
    step1Values.value = values;
    console.log(step1Values.value);
  }

  function handleStep2Next(values: any) {
    current.value++;
    state.initStep3 = true;
    step2Values.value = values;
  }

  function handleStep3Next(values: any) {
    current.value++;
    state.initStep4 = true;
    step3Values.value = values;
  }

  const handleCancel = () => {
    current.value = 0;
    success.value = false;
    closeModal();
    emit('cancel');
  };

  const successData = ref();
  const gender = computed(() => genders.find((res) => res.value === successData?.value.sex)?.label);
  function handleSubmit(values: any) {
    const subSysParams = values.outerSn ? [values] : [];
    const sendData = {
      ...step1Values.value,
      ...step2Values.value,
      ...step3Values.value,
      subSysParams,
    };
    console.log(sendData);
    try {
      addPlant(sendData).then((res) => {
        if (res) {
          //closeModal();
          successData.value = sendData;
          success.value = true;
          createMessage.success('Add plant successful');
          current.value = 0;
          emit('addSuccess');
        } else {
          createMessage.error('Add plant failed');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  const copyEmail = (email, password) => {
    password ? copyText(`${email} ${password}`) : copyText(`${email}`);
  };
</script>
<style lang="less" scoped>
  .add-success-con {
    margin-top: 40px;
  }
  .plantInfo-item {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(0, 0, 0, 0.2);
    .left {
      display: flex;
      flex-direction: column;
    }
    .plantInfoDetail {
      width: 420px;
      padding: 8px 0;
    }
  }
  .copy-email {
    cursor: pointer;
    color: #808080;

    &:hover {
      color: #000;
    }
  }
</style>
