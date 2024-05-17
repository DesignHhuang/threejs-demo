import { computed, unref } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import type { Rule as ValidationRule } from 'ant-design-vue/lib/form/interface';
import {
  validateCompanyCode,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validatePolicy,
} from '@/utils/FormValidateConfig';

export function useFormRules(formData?: Recordable) {
  const { t } = useI18n();

  const getFormRules = computed((): { [k: string]: ValidationRule | ValidationRule[] } => {
    return {
      companyCode: [{ validator: validateCompanyCode(), trigger: 'change' }],

      companyName: [{ required: true }],
      registerCompanyName: [{ required: true, message: t('sys.register.companyNamePlaceholder') }],
      country: [{ required: true, message: t('sys.register.countryPlaceholder') }],
      address: [{ required: true, message: t('sys.register.addressPlaceholder') }],
      userName: [{ required: true, message: t('sys.register.usernamePlaceholder') }],
      gender: [{ required: true, message: t('sys.register.genderPlaceholder') }],
      email: [{ validator: validateEmail(), trigger: 'change' }],
      password: [{ validator: validatePassword(), trigger: 'change' }],
      confirmPassword: [
        { validator: validateConfirmPassword(unref(formData)?.password), trigger: 'change' },
      ],

      checkBox: [{ validator: validatePolicy, trigger: 'change' }],
    };
  });
  return { getFormRules };
}
