<template>
  <BasicModal
    @register="register"
    v-bind="$attrs"
    title="Service log"
    mask-closable
    :footer="null"
    :width="800"
  >
    <div class="flex items-center justify-between service-detail-top">
      <div class="flex items-center">
        <Icon icon="post|svg" style="color: #818792" :size="1" />
        <span class="detail-name">
          {{ operatorName }} posted on {{ formatToDateTime(createTime, 'YYYY/MM/DD/HH:mm') }}
        </span>
      </div>
      <span class="tag tag-service">
        <Icon icon="service|svg" style="color: '#7662fd'" />
        <span class="text">SERVICE LOG</span>
      </span>
    </div>

    <div class="flex service-detail">
      <div class="icon" :style="{ backgroundColor: getRandomColor() }">
        {{ operatorName && operatorName[0].toUpperCase() }}
      </div>
      <div class="content">
        <div class="title">{{ logName }}</div>
        <div v-html="logDesc"></div>
      </div>
    </div>

    <div class="add-log-footer">
      <div class="cancel" @click="closeModal">OK</div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import Icon from '@/components/Icon/Icon.vue';
  import { getRandomColor } from '@/utils/color';
  import { formatToDateTime } from '/@/utils/dateUtil';

  const logName = ref();
  const operatorName = ref();
  const logDesc = ref();
  const createTime = ref();

  const [register, { closeModal }] = useModalInner((data) => {
    logName.value = data.logName;
    operatorName.value = data.operatorName;
    logDesc.value = data.logDesc;
    createTime.value = data.createTime;
  });
</script>

<style lang="less" scoped>
  .detail-name {
    color: #818792;
    font-size: 14px;
    margin-left: 5px;
  }
  .service-detail-top {
    margin-left: 43px;
    margin-bottom: 6px;
  }

  .service-detail {
    .icon {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      font-size: 16px;
      justify-content: center;
      font-weight: 600;
      color: #f4f5f7;
    }
    .content {
      border-radius: 20px;
      background: #f4f5f7;
      padding: 8px 20px;
      margin-left: 4px;
      flex: 1;
      max-width: 695px;
      min-height: 300px;
      overflow: auto;

      .title {
        color: #2c2d30;
        font-size: 30px;
        font-weight: 600;
      }
    }
  }

  .add-log-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    .cancel {
      width: 200px;
      height: 40px;
      border-radius: 30px;
      background: #e2e4ea;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: #818792;
      font-size: 16px;
      cursor: pointer;
    }
  }
</style>
