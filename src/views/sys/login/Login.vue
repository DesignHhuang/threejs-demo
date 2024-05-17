<template>
  <div :class="prefixCls" class="flex w-full h-full px-4 items-center">
    <div class="w-1/2 flex justify-center">
      <img class="-enter-x" :src="loginBg" alt="logo" />
    </div>
    <div class="w-1/2 flex justify-center">
      <div class="container">
        <span class="flex items-center mb-24 enter-x">
          <span class="app-welcome">Welcome to</span>
          <AppLogo class="app-logo" :showTitle="false" />
        </span>

        <LoginForm @resetPassword="handleResetPassword" />
        <ForgetPasswordForm />
        <ResetPasswordForm :username="account" :password="password" />

        <div :class="`${prefixCls}-footer`" class="mt-16 enter-x">
          <div>Copyright &copy {{ dayjs().format('YYYY') }} Wattsonic. All rights reserved.</div>
          <!-- <div
            >Mobile App supported, <a @click="">click</a> to download Wattsonic Monitoring App.</div
          > -->
          <!-- <div>Privacy Policy | Terms of Use | Cookies Policy</div> -->
          <div>
            <a href="https://www.wattsonic.com/privacy" target="_blank"> Privacy Policy </a>
            |
            <a href="https://www.wattsonic.com/legal" target="_blank"> Cookies Policy </a>
          </div>
          <!-- <a @click="setLoginState(LoginStateEnum.RESET_PASSWORD)">首次登录强制用户修改密码</a> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { AppLogo } from '/@/components/Application';
  import LoginForm from './LoginForm.vue';
  import ForgetPasswordForm from './ForgetPasswordForm.vue';
  import ResetPasswordForm from './ResetPasswordForm.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import dayjs from 'dayjs';
  import loginBg from '/@/assets/svg/login-bg.svg';

  const { prefixCls } = useDesign('login');
  const account = ref('');
  const password = ref('');

  const handleResetPassword = (data: any) => {
    account.value = data.account;
    password.value = data.password;
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    overflow: hidden;
    position: absolute;

    .@{prefix-cls}-form {
      min-width: 25rem;
      top: -10rem;
    }

    .@{prefix-cls}-footer {
      color: #5b6577;
      font-size: 10px;
      line-height: 1.5715;

      a {
        cursor: pointer;
        text-decoration-line: none;
        color: #5b6577;

        &:hover {
          color: @colorPrimary;
        }
      }
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: start;

      .app-welcome {
        font-size: 36px;
        font-weight: 600;
        margin-right: 10px;
      }

      .app-logo {
        height: 53px;
      }
    }
  }
</style>
