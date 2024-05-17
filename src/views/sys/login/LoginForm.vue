<template>
  <a-form
    class="enter-x w-120"
    :model="formData"
    :rules="getFormRules"
    ref="formRef"
    v-show="getShow"
    @keypress.enter="handleLogin"
  >
    <a-form-item name="account" class="enter-x" hasFeedback>
      <a-input v-model:value="formData.account" :placeholder="t('sys.login.email')" />
    </a-form-item>
    <a-form-item name="password" class="enter-x">
      <InputPassword
        visibilityToggle
        v-model:value="formData.password"
        :placeholder="t('sys.login.password')"
      />
    </a-form-item>

    <a-row class="enter-x">
      <a-col :span="16">
        <a-form-item name="checkBox">
          <Checkbox v-model:checked="formData.checkBox" size="small">
            <span class="checkBox-text">
              I agree to all statement include in Private policy and Cookies policy.
            </span>
          </Checkbox>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item :style="{ 'text-align': 'right' }">
          <a-button type="link" size="small" @click="setLoginState(LoginStateEnum.FORGET_PASSWORD)">
            {{ t('sys.login.forgetPassword') }}
          </a-button>
        </a-form-item>
      </a-col>
    </a-row>

    <a-form-item class="enter-x">
      <a-button type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </a-button>
    </a-form-item>

    <a-row>
      <a-col>
        <a-button type="link" size="small" @click="goOrganizationRegiset">
          {{ t('sys.login.organizationRegister') }}
        </a-button>
      </a-col>

      <a-col>
        <ADivider style="margin: auto" type="vertical" />
      </a-col>
      <a-col>
        <a-button type="link" size="small" @click="goUserRegiset">
          {{ t('sys.login.userRegister') }}
        </a-button>
      </a-col>
    </a-row>
  </a-form>
  <OrganizationRegisterModel @register="orgRegisterModel" @add-success="addSuccess()" />
</template>

<script lang="ts" setup>
  import { reactive, ref, unref, computed } from 'vue';
  import { Input, Checkbox, Divider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules } from './useLogin';
  import { useRoute } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { useModal } from '/@/components/Modal';
  import OrganizationRegisterModel from '../register/OrganizationRegisterModel.vue';

  const [orgRegisterModel, { openModal }] = useModal();

  const addSuccess = () => {
    console.log('addSuccess');
  };

  const InputPassword = Input.Password;
  const ADivider = Divider;

  const { t } = useI18n();
  const userStore = useUserStore();
  const route = useRoute();
  const { getLoginState, setLoginState } = useLoginState();
  const { getFormRules } = useFormRules();

  const formRef = ref();
  const loading = ref(false);

  const go = useGo();

  const formData = reactive({
    account: '',
    password: '',
    checkBox: false,
  });

  const { validForm } = useFormValid(formRef);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  const emit = defineEmits(['resetPassword']);

  const handleLogin = async () => {
    const data = await validForm();
    if (!data) return;
    emit('resetPassword', data);
    try {
      loading.value = true;
      await userStore.login({
        password: data.password,
        username: data.account,
        goWhere: route.query.redirect as string,
      });
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  };

  const goOrganizationRegiset = async () => {
    // go('/registerOrganization');
    openModal();
  };
  const goUserRegiset = async () => {
    go('/registerUser');
  };
</script>
<style lang="less">
  .checkBox-text {
    color: #5b6577;
    font-size: 12px;
    font-weight: 400;
  }
</style>
