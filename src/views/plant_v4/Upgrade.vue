<template>
  <div class="progress" v-if="upgradeResult === 0" @click="handleClick">
    <Progress
      type="circle"
      trail-color="#e6f4ff"
      status="active"
      :percent="percent"
      :stroke-width="20"
      :size="20"
      :format="(number) => `Upgrading: ${number}%`"
    />
    <span style="margin-left: 8px">{{ percent }}%</span>
  </div>
  <div class="progress" v-if="upgradeResult === 1" @click="handleClick">
    <!-- <Icon icon="ep:success-filled" size="20" color="#1BAAFB" /> -->
    <Tooltip title="Upgrade Successful">
      <span style="margin: 4px">Success</span>
    </Tooltip>
    <Icon class="close" icon="eva:close-outline" size="16" @click="handleClose" />
  </div>
  <div class="progress" v-if="upgradeResult === 2" @click="handleClick">
    <!--  <Icon icon="ic:round-error" size="20" color="#F5222D" /> -->
    <Tooltip title="Upgrade Failed">
      <span style="margin: 4px">Failure</span>
    </Tooltip>

    <Icon class="close" icon="eva:close-outline" size="16" @click="handleClose" />
  </div>
</template>

<script lang="ts" setup>
  import { Progress, Tooltip } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';

  defineProps({
    percent: { type: Number, default: 0 },
    upgradeResult: { type: Number, default: 0 },
  });

  const emit = defineEmits(['close', 'open-upgrade']);

  const handleClose = () => {
    emit('close');
  };

  const handleClick = () => {
    emit('open-upgrade');
  };
</script>

<style lang="less" scoped>
  .progress {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: #e2e4ea;
    height: 32px;
    padding: 10px;
    cursor: pointer;

    .close {
      cursor: pointer;

      &:hover {
        color: @colorPrimary;
      }
    }
  }
</style>
