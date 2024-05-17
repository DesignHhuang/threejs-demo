<template>
  <a-form layout="vertical" ref="formRef" :model="formState" :rules="step2FormRules">
    <div class="create-plant-note" style="margin-bottom: 24px">
      Note: The account information on this page will be used as the company’s administrator
      account.
    </div>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-form-item name="sex" hasFeedback>
          <a-select placeholder="* Mr." v-model:value="formState.sex" :options="genders" />
        </a-form-item>
      </a-col>
      <a-col :span="16">
        <a-form-item name="contactName" hasFeedback>
          <a-input v-model:value="formState.contactName" placeholder="Your Name" :maxlength="32" />
        </a-form-item>
      </a-col>
    </a-row>
    <a-form-item name="email" hasFeedback>
      <a-input v-model:value="formState.email" :maxlength="120" placeholder="* Email" />
    </a-form-item>

    <a-form-item name="mobile" required hasFeedback>
      <a-input v-model:value="formState.mobile" :maxlength="16" placeholder="* Mob." />
    </a-form-item>

    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item name="password">
          <a-input-password
            v-model:value="formState.password"
            :placeholder="t('sys.login.password')"
            autocomplete="new-password"
          />
        </a-form-item>
      </a-col>

      <a-col :span="24">
        <a-form-item name="confirmPassword">
          <a-input-password
            v-model:value="formState.confirmPassword"
            :placeholder="t('sys.login.confirmPassword')"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item name="checkBox">
          <Checkbox v-model:checked="formState.checkBox" size="small" name="checkBox">
            <span class="checkBox-text"
              >I agree to the
              <a href="https://www.wattsonic.com/legal" target="_blank"> Cookies Policy </a>
              and
              <a href="https://www.wattsonic.com/privacy" target="_blank"> Privacy Policy </a
              >.</span
            >
          </Checkbox>
        </a-form-item>
      </a-col>
    </a-row>

    <div class="modal-footer-old">
      <a-button class="modal-cancel mr-4" @click="backFunc">Previous</a-button>
      <a-button class="modal-save" @click="doneFunc">Submit</a-button>
    </div>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed } from 'vue';
  import { Checkbox } from 'ant-design-vue';
  import { OrganizationRegisterModel } from '#/store';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { genders } from '@/enums/appEnum';

  import {
    validateEmail,
    validatePassword,
    validatePolicy,
    validateConfirmPassword,
  } from '/@/utils/FormValidateConfig';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['submit', 'prev']);
  const { t } = useI18n();

  const formRef = ref();
  const { validForm } = useFormValid(formRef);
  const formState = reactive<OrganizationRegisterModel>({
    contactName: '',
    sex: 1,
    email: '',
    password: '',
    mobile: '',
    checkBox: false,
  });

  const step2FormRules = computed(() => ({
    contactName: [{ required: true, message: t('sys.register.usernamePlaceholder') }],
    sex: [{ required: true, message: t('sys.register.genderPlaceholder') }],
    email: [{ validator: validateEmail(), trigger: 'change' }],
    password: [{ validator: validatePassword(), trigger: 'change' }],
    confirmPassword: [
      { validator: validateConfirmPassword(formState?.password ?? ''), trigger: 'change' },
    ],

    checkBox: [{ validator: validatePolicy, trigger: 'change' }],
  }));

  async function backFunc() {
    emit('prev');
  }

  async function doneFunc() {
    const data = await validForm();
    if (!data) return;
    emit('submit', data);
  }
</script>
