<template>
  <div class="overview-systemlog">
    <div class="card-name">
      <div class="flex items-center">
        <img class="w-h-40" :src="system_log_v4" alt="system_log_v4" />
        <div class="smallcard1-title system-log-name">System log</div>
      </div>
      <!-- <Tooltip title="Add log">
        <div class="icon-btn">
          <img class="add-icon-img" :src="fullscreen_v4" alt="fullscreen_v4" />
        </div>
      </Tooltip> -->
    </div>
    <div class="add-syslog" @click.stop="addSystemLog">
      <img class="add-icon-img" :src="add_v4" alt="add_v4" />
    </div>
    <div class="systemlog">
      <div class="systemlog-item" v-for="log in sysLogList" :key="log.logId" @click="goToSystemLog">
        <span class="tag tag-info" v-if="log.logLevel === 'INFO'"> [Running] </span>
        <span class="tag tag-error" v-else-if="log.logLevel === 'ERROR'"> [Error] </span>
        <span class="tag tag-warn" v-else-if="log.logLevel === 'WARN'"> [Warning] </span>
        <span class="tag tag-service" v-else> [{{ log.logLevel }}]</span>
        <div>
          <div class="desc">{{ log.logDesc }}</div>
          <div class="tip">
            <div> <{{ formatToDateTime(log.updateTime, 'YYYY/MM/DD/HH:mm') }}> </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AddSystemLog @register="registerSystemLog" @addSuccess="servicelogAdded()" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import Icon from '@/components/Icon/Icon.vue';
  import { getSysLogList } from '/@/api/wattspace/system';
  import { useRequest } from 'vue-request';
  import AddSystemLog from './add.vue';
  import { useModal } from '@/components/DeskModal';
  import { useGo } from '/@/hooks/web/usePage';
  import add_v4 from '@/assets/svg/add_v4.svg';
  import fullscreen_v4 from '@/assets/svg/fullscreen_v4.svg';
  import system_log_v4 from '@/assets/svg/system_log_v4.svg';

  const props = defineProps({ plantId: { type: String, default: '' } });

  const [registerSystemLog, { openModal }] = useModal();
  const go = useGo();

  const sysLogList = ref();
  const { run: loadSysLogList } = useRequest(getSysLogList, {
    manual: false,
    defaultParams: [{ current: 1, size: 1000, plantId: props.plantId }],
    onSuccess: (data) => {
      sysLogList.value = data.records;
    },
  });

  const addSystemLog = () => {
    openModal(true, { plantId: props.plantId });
  };

  const servicelogAdded = () => {
    loadSysLogList({ current: 1, size: 1000, plantId: props.plantId });
  };

  const goToSystemLog = () => {
    go(`/plantList/systemLog/${props.plantId}`);
  };
</script>

<style lang="less" scoped>
  .overview-systemlog {
    display: flex;
    flex-direction: column;
    border-radius: 1.25rem;
    width: 38.125rem;
    margin-right: 1rem;
    height: 25rem;
    border: 2px solid rgba(255, 255, 255, 0.6);
    background: rgba(0, 0, 0, 0.9);
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(45px);
  }
  .system-log-name {
    color: #ffffff;
  }
  .add-icon-img {
    height: 0.875rem;
    width: 0.875rem;
  }
  .systemlog {
    flex: 1;
    margin: 0 24px;
    overflow: auto;
    border-left: 1px solid rgba(255, 255, 255, 0.2);

    .systemlog-item {
      display: flex;
      padding: 0.25rem;
      margin-left: 0.625rem;
      margin-bottom: 0.25rem;
      border-radius: 0.625rem;
      cursor: pointer;
      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      .tag {
        height: 1.375rem;
        padding: 0 0.375rem;
        color: #f5f5f7;
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.875rem;
      }
      .desc {
        color: #f5f5f7;
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.375rem;
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2; /* 这里是超出几行省略 */
        overflow: hidden;
      }
      .tip {
        display: flex;
        align-items: center;
        color: #808080;
        font-size: 0.75rem;
        font-weight: 400;
        line-height: 1.875rem;
      }
    }
  }
  .add-syslog {
    display: flex;
    margin: 0 0.625rem 0.625rem 0.625rem;
    align-items: center;
    justify-content: center;
    height: 2.5rem;
    cursor: pointer;
    border-radius: 0.625rem;
    background: rgba(255, 255, 255, 0.1);
  }
</style>
