<template>
  <div :class="prefixCls">
    <div class="register-top">
      <div class="top-title"> {{ t('sys.register.userRegister') }} </div>

      <div class="top-content">
        <img :src="warnSvg" />{{ t('sys.register.userRegisterDesc') }}
      </div>
    </div>
    <div class="register-content">
      <a-form layout="vertical" ref="formRef" :model="formState" :rules="getFormRules">
        <div class="content-section">
          <div class="content-title">{{ t('sys.register.yourSuperiorCompany') }}</div>
          <div class="content-form">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="companyCode">
                  <a-input
                    v-model:value="formState.companyCode"
                    placeholder="Company ID"
                    :maxlength="6"
                    @change="companyIDChangeHandler"
                  />
                </a-form-item>
              </a-col>

              <a-col :span="12">
                <a-form-item name="companyName">
                  <a-input
                    v-model:value="formState.companyName"
                    placeholder="Company Name"
                    readOnly
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </div>

        <div class="content-section">
          <div class="content-title">{{ t('sys.register.yourAccountInfo') }}</div>
          <div class="content-form">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="userName">
                  <a-input
                    v-model:value="formState.userName"
                    placeholder="Your Name"
                    :maxlength="32"
                  />
                </a-form-item>
              </a-col>

              <a-col :span="12">
                <a-form-item name="email">
                  <a-input v-model:value="formState.email" placeholder="Email" :maxlength="120" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item name="gender">
                  <a-select
                    placeholder="Please select gender"
                    v-model:value="formState.gender"
                    :options="genders"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item name="password">
                  <a-input-password
                    v-model:value="formState.password"
                    :placeholder="t('sys.login.password')"
                    autocomplete="new-password"
                  />
                </a-form-item>
              </a-col>

              <a-col :span="12">
                <a-form-item name="confirmPassword">
                  <a-input-password
                    v-model:value="formState.confirmPassword"
                    :placeholder="t('sys.login.confirmPassword')"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </div>

        <div class="content-section">
          <div class="content-form">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item name="checkBox">
                  <Checkbox v-model:checked="formState.checkBox" size="small" name="checkBox">
                    <span class="checkBox-text"
                      >I agree to the
                      <a href="https://www.wattsonic.com/legal" target="_blank"> Cookies Policy </a>
                      and
                      <a href="https://www.wattsonic.com/privacy" target="_blank">
                        Privacy Policy </a
                      >.</span
                    >
                  </Checkbox>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </div>
        <div
          style="
            margin: 0 auto;
            width: 500px;
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          "
        >
          <a-button style="width: 200px; height: 53px" @click="cancelHandler">Cancel</a-button>
          <a-button
            style="width: 200px; height: 53px"
            type="primary"
            html-type="submit"
            @click="handleSubmit"
            >Submit</a-button
          >
        </div>
      </a-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { UserRegisterModel } from '/#/store';
  import warnSvg from '/@/assets/svg/warn.svg';
  import { Checkbox } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUserStore } from '/@/store/modules/user';
  import { getCountryNameWithCodeApi } from '/@/api/sys/user';
  import { useFormRules } from './register-config';
  import { PageEnum } from '/@/enums/pageEnum';
  import { useGo } from '/@/hooks/web/usePage';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { genders } from '@/enums/appEnum';

  const go = useGo();

  const { prefixCls } = useDesign('register');
  const { t } = useI18n();
  const userStore = useUserStore();
  const formRef = ref();

  const formState = reactive<UserRegisterModel>({
    companyID: '',
    companyCode: '',
    companyName: '',
    userName: '',
    email: '',
    gender: null,
    password: '',
    confirmPassword: '',
    checkBox: false,
  });
  const { getFormRules } = useFormRules(formState);
  const { validForm } = useFormValid(formRef);
  const companyIDChangeHandler = async (val) => {
    const comId = (val.target.value as string).toLocaleUpperCase().replace(/[^\d]/g, '');
    formState.companyCode = comId;
    const regex: RegExp = /^[0-9]{6}$/;
    if (regex.test(comId)) {
      console.log(comId);
      const res = await getCountryNameWithCodeApi(comId);
      formState.companyName = res.companyName;
      formState.companyID = res.companyId;
    } else {
      formState.companyName = '';
    }
  };

  const handleSubmit = async () => {
    const data = await validForm();
    if (!data) return;
    try {
      const { companyCode, userName, email, password, gender } = formState;
      await userStore.userRegister({
        companyCode: companyCode,
        name: userName,
        email: email,
        password: password,
        sex: gender,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const cancelHandler = () => {
    go(PageEnum.BASE_LOGIN, true);
  };
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-register';

  .@{prefix-cls} {
    .ant-input,
    .ant-input-affix-wrapper {
      background-color: #fff;
    }
  }
  .register-top {
    width: 1200px;
    margin: auto;
    padding: 30px;

    .top-title {
      font-size: 40px;
      color: #2c2d30;
    }
    .top-content {
      font-size: 17px;
      color: #5b6577;
      margin-top: 12px;
    }
  }
  .register-content {
    width: 1200px;
    margin: auto;
    padding: 30px;
    border-radius: 40px;
    background: #eeeff4;
    /* 默认/背景 */
    box-shadow: 4px 4px 8px 0px rgba(174, 174, 192, 0.4), -2.8px -2.8px 8px 0px #fff,
      0px 0px 0px 0.533px rgba(255, 255, 255, 0.2) inset;

    .content-title {
      font-size: 20px;
      color: #2c2d30;
      font-weight: 600;
      line-height: normal;
      margin-bottom: 20px;
    }
  }
</style>
