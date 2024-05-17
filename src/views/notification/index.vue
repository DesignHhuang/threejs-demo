<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__header`">
      <div class="flex">
        <span
          class="tag tag-all"
          :class="{ 'tag-all-active': active === 'all' }"
          @click="getByAll()"
        >
          <Icon icon="icon-park-outline:dot" :color="active === 'all' ? '#E2E4EA' : '#2c2d30'" />
          <span class="text">All</span>
        </span>
        <span
          class="tag tag-closed"
          :class="{ 'tag-closed-active': active === 'unread' }"
          @click="getByStatus(false)"
        >
          <Icon icon="icon-park-outline:dot" :color="active === 'unread' ? '#E2E4EA' : '#7662fd'" />
          <span class="text">Unread</span>
        </span>
        <span
          class="tag tag-going"
          :class="{ 'tag-going-active': active === 'readed' }"
          @click="getByStatus(true)"
        >
          <Icon icon="icon-park-outline:dot" :color="active === 'readed' ? '#E2E4EA' : '#10cb18'" />
          <span class="text">Read</span>
        </span>
      </div>
    </div>
    <div :class="`${prefixCls}__container`">
      <List :pagination="paginationProp">
        <template v-for="item in notifications" :key="item.id">
          <List.Item>
            <List.Item.Meta style="position: relative">
              <template #avatar>
                <Icon
                  class="icon"
                  :color="item.readStatus ? '#10cb18' : '#7662fd'"
                  icon="icon-park-outline:dot"
                  size="24"
                />
              </template>
              <template #description>
                <div :class="`${prefixCls}__content`">
                  Time:{{ formatToDateTime(item.createTime) }}
                </div>
              </template>
              <template #title>
                <div class="title" @click="toDetail(item.id, item.relationId, item.relationType)">
                  {{ item.messageTitle }}
                </div>
                <span class="extra" style="margin-right: 20px" @click="done(item.id)">Done</span>
              </template>
            </List.Item.Meta>
          </List.Item>
        </template>
      </List>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { List } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRequest } from 'vue-request';
  import {
    getNotifications,
    setDoneNotification,
    setReadNotification,
  } from '/@/api/wattspace/serviceTicket';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';

  const prefixCls = 'notification';
  const active = ref('all');
  const go = useGo();
  const { createMessage } = useMessage();
  const userStore = useUserStore();

  const done = async (id: string) => {
    const result = await setDoneNotification([id]);
    if (result) {
      createMessage.success('Operation success');
      if (active.value === 'all') {
        run({ current: current.value, size: pageSize.value });
      } else {
        const status = active.value === 'readed' ? true : false;
        run({ current: current.value, size: pageSize.value, readStatus: status });
      }
    } else {
      createMessage.error('Operation failed');
    }
  };

  const toDetail = (id: string, relationId: string, relationType: number) => {
    if (relationType === 0) {
      setReadNotification([id]);
      go(`/serviceTicket/detail/${relationId}`);
      setTimeout(() => {
        userStore.fetchUnreadNotification();
      }, 200);
    }
  };

  //分页相关
  const current = ref(1);
  const pageSize = ref(100);
  const total = ref(0);
  const paginationProp = ref({
    showSizeChanger: false,
    showQuickJumper: true,
    pageSize,
    current,
    hideOnSinglePage: true,
    total,
    onChange: pageChange,
  });

  function pageChange(p: number, pz: number) {
    current.value = p;
    pageSize.value = pz;
    if (active.value === 'all') {
      run({ current: current.value, size: pageSize.value });
    } else {
      const status = active.value === 'readed' ? true : false;
      run({ current: current.value, size: pageSize.value, readStatus: status });
    }
  }

  const { run, data } = useRequest(getNotifications, {
    manual: false,
    defaultParams: [{ current: current.value, size: pageSize.value }],
    onSuccess: (data) => {
      total.value = data.total;
    },
  });
  const notifications = computed(() => data.value?.records);

  const getByAll = () => {
    active.value = 'all';
    current.value = 1;
    run({ current: current.value, size: pageSize.value });
  };

  const getByStatus = (readStatus: boolean) => {
    active.value = readStatus ? 'readed' : 'unread';
    current.value = 1;
    run({ current: current.value, size: pageSize.value, readStatus });
  };
</script>
<style lang="less" scoped>
  .notification {
    width: 1200px;
    margin: 8.75rem auto 1.875rem auto;
    border-radius: 40px;
    background: #eeeff4;
    /* 默认/背景 */
    box-shadow: 4px 4px 8px 0px rgba(174, 174, 192, 0.4), -2.8px -2.8px 8px 0px #fff,
      0px 0px 0px 0.533px rgba(255, 255, 255, 0.2) inset;

    &__header {
      display: flex;
      justify-content: space-between;
      padding: 30px 30px 0 30px;
    }

    &__container {
      padding: 12px;
      //background-color: @component-background;

      .icon {
        position: absolute;
        top: 16px;
      }
      .title {
        color: #2c2d30;
        font-size: 18px;
        font-weight: 500;
        margin-left: 20px;
        max-width: 1000px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        word-break: break-all;
        -webkit-box-orient: vertical;
        cursor: pointer;
        &:hover {
          color: @colorPrimary;
        }
      }
      .extra {
        position: absolute;
        top: 16px;
        right: 15px;
        cursor: pointer;
        color: #818792;
        margin-right: 20px;

        &:hover {
          color: @colorPrimary;
        }
      }
    }

    &__content {
      color: @colorTextSecondary;
      margin-left: 20px;
    }
  }

  .tag {
    padding: 0 12px;
    display: flex;
    align-items: center;
    border-radius: 15px;
    height: 21px;
    font-weight: 600;
    cursor: pointer;
    width: fit-content;
    margin-right: 12px;
    .text {
      font-size: 12px;
    }
  }
  .tag-all {
    background: #e2e4ea;
    color: #2c2d30;
  }
  .tag-going {
    background: #e2e4ea;
    color: #10cb18;
  }

  .tag-closed {
    background: #e2e4ea;
    color: #7662fd;
  }
  .tag-all-active {
    background: #2c2d30;
    color: #e2e4ea;
  }
  .tag-going-active {
    background: #10cb18;
    color: #e2e4ea;
  }

  .tag-closed-active {
    background: #7662fd;
    color: #e2e4ea;
  }
</style>
