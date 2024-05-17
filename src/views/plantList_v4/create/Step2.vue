<template>
  <a-form layout="vertical" ref="formRef" :model="formState" :rules="step2FormRules">
    <a-form-item name="email">
      <a-input
        v-model:value="formState.email"
        :maxlength="120"
        placeholder="* Email"
        @change="handleEmailChange"
      />
    </a-form-item>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-form-item name="sex">
          <a-select
            placeholder="* Mr."
            v-model:value="formState.sex"
            :options="genders"
            :disabled="sexDisable"
          />
        </a-form-item>
      </a-col>
      <a-col :span="16">
        <a-form-item name="ownerName">
          <a-input
            v-model:value="formState.ownerName"
            :maxlength="32"
            placeholder="* Name"
            :disabled="ownerNameDisable"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-form-item name="mobile">
      <a-input
        v-model:value="formState.mobile"
        :disabled="ownerNameDisable"
        :maxlength="16"
        placeholder="Telephone"
      />
    </a-form-item>
    <div class="modal-footer">
      <DeskButton :isIcon="true" px :icon="previous_step_v4" @click="backFunc" />
      <DeskButton :isIcon="true" px :icon="next_step_v4" @click="submitFunc" />
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref, h, computed } from 'vue';
  import { PlantInfo } from '#/store';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { checkEmail } from '/@/api/wattspace/system';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { validateTel } from '/@/utils/FormValidateConfig';
  import { isEmail } from '/@/utils/is';
  import { useDebounceFn } from '@vueuse/core';
  import { genders } from '@/enums/appEnum';
  import previous_step_v4 from '@/assets/svg/previous_step_v4.svg';
  import next_step_v4 from '@/assets/svg/next_step_v4.svg';

  const emit = defineEmits(['next', 'prev']);

  const currentOwnerType = ref(0);
  const { createConfirm } = useMessage();

  const formRef = ref();
  const ownerNameDisable = ref();
  const sexDisable = ref();
  const { validForm } = useFormValid(formRef);
  const password = ref('Watt4freedom!'); //默认密码
  const formState = reactive<PlantInfo>({
    sex: 1,
    ownerName: '',
    email: '',
    mobile: '',
  });

  const isCheckedEmail = ref(false);
  async function changeEmail(e) {
    const value = e.target.value.trim();
    isCheckedEmail.value = false;
    if (!value) {
      currentOwnerType.value = 0;
      ownerNameDisable.value = false;
      sexDisable.value = false;
      password.value = 'Watt4freedom!';
      return;
    }
    const { ownerType } = await checkEmail({ email: value });
    currentOwnerType.value = ownerType;
    if (ownerType === 1) {
      ownerNameDisable.value = true;
      sexDisable.value = true;
      password.value = '';
    }
    if (ownerType === 0) {
      ownerNameDisable.value = false;
      sexDisable.value = false;
      password.value = 'Watt4freedom!';
    }
  }
  const handleEmailChange = useDebounceFn(changeEmail, 600);

  const validateStep2Email = () => {
    return async (_, value: string) => {
      if (!value) {
        return Promise.reject('Please enter email');
      }
      if (!isEmail(value)) {
        return Promise.reject('Email format error');
      }
      // 判断邮箱
      const { ownerType, sex, name, mobile } = await checkEmail({ email: value });
      if (ownerType === 1 && !isCheckedEmail.value) {
        createConfirm({
          iconType: 'info',
          title: () => h('span', 'This email has been registered'),
          content: () =>
            h(
              'span',
              'After submission, the power station will be authorized to this email account',
            ),
          onOk: () => {
            // 填上基本信息
            formState.sex = sex;
            formState.ownerName = name;
            formState.mobile = mobile;
            isCheckedEmail.value = true;
            password.value = '';
          },
          onCancel: () => {
            currentOwnerType.value = 0;
            ownerNameDisable.value = false;
            sexDisable.value = false;
            // 删除邮箱，重新填写
            formState.email = '';
            password.value = 'Watt4freedom!';
          },
        });
      }
      if (ownerType === 2) {
        return Promise.reject('Employee email cannot be used');
      }
      return Promise.resolve();
    };
  };

  const step2FormRules = computed(() => ({
    sex: [{ required: true, message: 'Please select gender' }],
    ownerName: [{ required: true, message: 'Please enter owner name' }],
    email: [{ validator: validateStep2Email(), trigger: 'blur' }],
    telephone: [{ validator: validateTel(), trigger: 'change' }],
  }));

  async function backFunc() {
    emit('prev');
  }

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;
    if (currentOwnerType.value === 0) {
      emit('next', { ...data, ownerType: currentOwnerType.value, password: password.value });
    } else {
      emit('next', { ...data, ownerType: currentOwnerType.value });
    }
  }
</script>
