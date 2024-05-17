<template>
  <template v-if="getShow">
    <div class="font-bold text-center w-100 mb-8 enter-x"> Forget password </div>
    <Form class="enter-x w-100" :model="formData" :rules="getFormRules" ref="formRef">
      <FormItem name="email" class="enter-x">
        <a-input size="large" v-model:value="formData.email" :placeholder="t('sys.login.email')" />
      </FormItem>

      <FormItem name="sms" class="enter-x">
        <CountdownInput
          size="large"
          v-model:value="formData.sms"
          placeholder="OTP"
          :send-code-api="loadCode"
        />
      </FormItem>

      <FormItem name="newPassword" class="enter-x">
        <InputPassword
          size="large"
          v-model:value="formData.newPassword"
          :placeholder="t('sys.login.password')"
        />
      </FormItem>

      <FormItem name="confirmPassword" class="enter-x">
        <InputPassword
          size="large"
          v-model:value="formData.confirmPassword"
          :placeholder="t('sys.login.confirmPassword')"
        />
      </FormItem>
      <FormItem class="enter-x">
        <Button type="primary" size="large" block @click="handleReset" :loading="loading">
          {{ t('sys.login.forgetFormTitle') }}
        </Button>
        <Button size="large" block class="mt-4" @click="handleBackLogin">
          {{ t('sys.login.backSignIn') }}
        </Button>
      </FormItem>
    </Form>
  </template>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed, unref } from 'vue';
  import { Form, Input, Button } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CountdownInput } from '/@/components/CountDown';
  import { useLoginState, useFormRules, LoginStateEnum } from './useLogin';
  import { resetPasswordApi, sendVerifyCodeApi } from '/@/api/sys/user';
  import { useFormValid } from '/@/hooks/web/useFormValid';

  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const formData = reactive({
    email: '',
    sms: '',
    newPassword: '',
    confirmPassword: '',
  });
  const formRef = ref();
  const loading = ref(false);

  const { t } = useI18n();
  const { handleBackLogin, getLoginState } = useLoginState();
  const { getFormRules } = useFormRules(formData);
  const { validForm } = useFormValid(formRef);

  const loadCode = () => sendVerifyCodeApi({ email: formData.email, type: 1 });

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.FORGET_PASSWORD);

  async function handleReset() {
    const data = await validForm();
    if (!data) return;

    const res = await resetPasswordApi({
      email: data.email,
      code: data.sms,
      newPassword: data.newPassword,
    });
    if (res) {
      formRef.value.resetFields();
      handleBackLogin();
    }
    // await form.resetFields();
  }
</script>
