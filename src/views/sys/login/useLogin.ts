import type { Rule as ValidationRule } from 'ant-design-vue/lib/form/interface';
import { ref, computed, unref } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import {
  validateConfirmPassword,
  validatePassword,
  validatePolicy,
} from '@/utils/FormValidateConfig';

export enum LoginStateEnum {
  LOGIN,
  FORGET_PASSWORD,
  RESET_PASSWORD,
}

const currentState = ref(LoginStateEnum.LOGIN);

// 这里也可以优化
// import { createGlobalState } from '@vueuse/core'

export function useLoginState() {
  function setLoginState(state: LoginStateEnum) {
    currentState.value = state;
  }

  const getLoginState = computed(() => currentState.value);

  function handleBackLogin() {
    setLoginState(LoginStateEnum.LOGIN);
  }

  return { setLoginState, getLoginState, handleBackLogin };
}

export function useFormRules(formData?: Recordable) {
  const { t } = useI18n();

  const getAccountFormRule = computed(() => createRule(t('sys.login.emailPlaceholder')));
  const getPasswordFormRule = computed(() => createRule(t('sys.login.passwordPlaceholder')));
  const getSmsFormRule = computed(() => createRule(t('sys.login.smsPlaceholder')));

  const getFormRules = computed((): { [k: string]: ValidationRule | ValidationRule[] } => {
    const accountFormRule = unref(getAccountFormRule);
    const passwordFormRule = unref(getPasswordFormRule);
    const smsFormRule = unref(getSmsFormRule);

    const mobileRule = {
      sms: smsFormRule,
    };
    switch (unref(currentState)) {
      // register form rules
      case LoginStateEnum.FORGET_PASSWORD:
        return {
          email: accountFormRule,
          newPassword: [{ validator: validatePassword(), trigger: 'change' }],
          confirmPassword: [
            { validator: validateConfirmPassword(formData?.newPassword), trigger: 'change' },
          ],
          ...mobileRule,
        };

      // reset password form rules
      case LoginStateEnum.RESET_PASSWORD:
        return {
          newPassword: [{ validator: validatePassword(), trigger: 'change' }],
          confirmPassword: [
            { validator: validateConfirmPassword(formData?.newPassword), trigger: 'change' },
          ],
        };

      // login form rules
      default:
        return {
          account: accountFormRule,
          password: passwordFormRule,
          checkBox: [{ validator: validatePolicy, trigger: 'change' }],
        };
    }
  });
  return { getFormRules };
}

function createRule(message: string): ValidationRule[] {
  return [
    {
      required: true,
      message,
      trigger: 'change',
    },
  ];
}
