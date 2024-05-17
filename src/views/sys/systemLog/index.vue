<template>
  <PageWrapper :breadcrumbs="breadcrumbs">
    <div :class="prefixCls">
      <div :class="`${prefixCls}__header`">
        <div class="flex">
          <span
            class="tag tag-all"
            :class="{ 'tag-all-active': active === 'all' }"
            @click="getLogListByLevel('')"
          >
            <Icon icon="icon-park-outline:dot" />
            <span class="text">All</span>
          </span>
          <span
            class="tag tag-service"
            :class="{ 'tag-service-active': active === 'service' }"
            @click="getLogListByLevel('service')"
          >
            <Icon
              icon="service|svg"
              :style="{ color: active === 'service' ? '#E2E4EA' : '#7662fd' }"
            />
            <span class="text">SERVICE LOG</span>
          </span>
          <span
            class="tag tag-info"
            :class="{ 'tag-info-active': active === 'info' }"
            @click="getLogListByLevel('info')"
          >
            <Icon
              icon="systemlog|svg"
              :style="{ color: active === 'info' ? '#E2E4EA' : '#077DEB' }"
            />
            <span class="text">SYSTEM LOG</span>
          </span>
          <span
            class="tag tag-error"
            :class="{ 'tag-error-active': active === 'error' }"
            @click="getLogListByLevel('error')"
          >
            <Icon
              icon="errorlog|svg"
              :style="{ color: active === 'error' ? '#E2E4EA' : '#FF3B30' }"
            />
            <span class="text">ERROR</span>
          </span>
          <span
            class="tag tag-warn"
            :class="{ 'tag-warn-active': active === 'warn' }"
            @click="getLogListByLevel('warn')"
          >
            <Icon
              icon="warning|svg"
              :style="{ color: active === 'warn' ? '#E2E4EA' : '#ff9500' }"
            />
            <span class="text">WARNING</span>
          </span>
        </div>
        <div class="flex">
          <a-range-picker
            style="margin-right: 10px"
            v-model:value="logDateRange"
            @change="handleChange"
          />
          <a-input
            placeholder="Search"
            style="width: 200px"
            v-model:value="searchKey"
            @change="searchKeyword"
          >
            <template #prefix>
              <Icon icon="search|svg" style="color: #5b6577" />
            </template>
          </a-input>
        </div>
      </div>
      <div :class="`${prefixCls}__container`">
        <div class="results">{{ total }} result</div>
        <div class="log-item flex items-center" v-for="item in logList" :key="item.logId">
          <Icon :color="sysLogColor(item)" class="icon" icon="icon-park-outline:dot" size="1" />
          <div class="content">
            <div class="title">{{ item.logName }}</div>
            <div class="desc">{{ item.logDescSub }}</div>
            <div class="flex items-center">
              <Icon icon="icon-park-solid:time" style="color: #b6b7ba" :size="1" />
              <span class="time">{{ formatToDateTime(item.createTime, 'YYYY/MM/DD/HH:mm') }}</span>
            </div>
          </div>
          <div class="hover-action" v-if="item.logLevel === 'SERVICE'">
            <div class="open-ticket open-ticket-top" @click="gotoTicketAdd(item)">
              Open ticket
              <Icon icon="open-ticket|svg" style="margin-left: 10px" />
            </div>
            <div class="open-ticket open-ticket-bottom" @click="openDetail(item)">
              Check details
              <Icon icon="check-detail|svg" style="margin-left: 10px" />
            </div>
          </div>
          <div class="hover-action" v-else>
            <div class="open-ticket" @click="gotoTicketAdd(item)">
              Open ticket
              <Icon icon="open-ticket|svg" style="margin-left: 10px" />
            </div>
          </div>
        </div>

        <div class="pagination">
          <Pagination
            :current="current"
            :pageSize="pageSize"
            :total="total"
            @change="pageChange"
            :showSizeChanger="false"
            :showQuickJumper="true"
            :hideOnSinglePage="true"
          />
        </div>
      </div>
    </div>

    <SystemLogDetail @register="register" />
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useRequest } from 'vue-request';
  import { RangePicker } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { getSysLogList } from '/@/api/wattspace/system';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { useModal } from '@/components/Modal';
  import { useDebounceFn } from '@vueuse/core';
  import { useGo } from '/@/hooks/web/usePage';
  import dayjs, { Dayjs } from 'dayjs';
  import { PageWrapper } from '@/components/Page';
  import { sysLogColor } from '@/utils/log';
  import { useRoute } from 'vue-router';
  import SystemLogDetail from './detail.vue';
  import { Pagination } from 'ant-design-vue';

  const aRangePicker = RangePicker;
  const go = useGo();
  const route = useRoute();
  const [register, { openModal }] = useModal();
  let plantId = route.params.plantId as string;

  const prefixCls = 'system-log';
  const active = ref('all');

  const logDateRange = ref<any>([]);
  let startTime: number | null = null;
  let endTime: number | null = null;
  const searchKey = ref<string>();
  const breadcrumbs = [
    {
      path: '/plantList/index',
      name: 'Plant List',
    },
    {
      name: 'System Log',
    },
  ];

  //分页相关
  const current = ref(1);
  const pageSize = ref(20);
  const total = ref(0);

  function pageChange(p: number, pz: number) {
    current.value = p;
    pageSize.value = pz;
    run({
      current: current.value,
      size: pageSize.value,
      startTime: startTime ?? undefined,
      endTime: endTime ?? undefined,
      keyword: searchKey.value ?? undefined,
      logLevel: active.value === 'all' ? null : active.value,
      plantId: plantId,
    });
  }

  const handleChange = (value: [string, string] | [Dayjs, Dayjs], dateString: [string, string]) => {
    current.value = 1;
    const start = dayjs(dateString[0]).valueOf();
    // 结束时间，加24小时
    const end = dayjs(`${dateString[1]} 23:59:59`).valueOf();
    startTime = isNaN(start) ? null : start;
    endTime = isNaN(end) ? null : end;
    run({
      current: current.value,
      size: pageSize.value,
      startTime: isNaN(start) ? null : start,
      endTime: isNaN(end) ? null : end,
      keyword: searchKey.value ?? undefined,
      plantId: plantId,
    });
  };

  const { run, data } = useRequest(getSysLogList, {
    manual: false,
    defaultParams: [{ current: current.value, size: pageSize.value, plantId: plantId }],
    onSuccess: (data) => {
      total.value = data.total;
    },
  });
  const logList = computed(() => data.value?.records);

  const getLogListByLevel = (level: string) => {
    active.value = level;
    searchKey.value = '';
    current.value = 1;
    logDateRange.value = [];
    if (level.length > 0) {
      active.value = level;
      run({ current: current.value, size: pageSize.value, logLevel: level, plantId: plantId });
    } else {
      active.value = 'all';
      run({ current: current.value, size: pageSize.value, plantId: plantId });
    }
  };

  const searchKeyword = useDebounceFn((e) => {
    searchKey.value = e.target.value;
    current.value = 1;
    run({
      keyword: e.target.value,
      startTime: startTime ?? undefined,
      endTime: endTime ?? undefined,
      current: current.value,
      size: pageSize.value,
      plantId: plantId,
    });
  }, 300);

  const openDetail = ({ logName, operatorName, logDesc, createTime }) => {
    openModal(true, { logName, operatorName, logDesc, createTime });
  };
  const gotoTicketAdd = (logItem) => {
    go(`/serviceTicket/create/${logItem.plantId}/${logItem.logId}/log`);
  };
</script>

<style lang="less">
  @import url('./index.less');
</style>
