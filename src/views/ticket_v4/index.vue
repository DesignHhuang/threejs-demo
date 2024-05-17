<template>
  <div class="service-ticket">
    <div class="service-ticket-toolbar">
      <div class="flex items-center">
        <div
          class="filter-dropdown"
          :class="{ 'filter-dropdown-active': ticketStore.getTicketStatusText !== 'All' }"
        >
          <div class="filter-dropdown-content">
            <div class="filter-select">
              <Icon icon="status|svg" class="filter-icon" :size="16" sizeType="px" />
              <div class="filter-select-text">
                <span class="text-1">{{ ticketStore.getTicketStatusText }} status</span>
              </div>
              <Icon icon="ep:arrow-down-bold" style="color: #808080" size="16" sizeType="px" />
            </div>

            <div class="filter-select-popover">
              <div
                class="filter-select-btn"
                :class="{ 'filter-select-active': ticketStore.getTicketFilter.open }"
                @click="getItemByFilters('open')"
              >
                <span class="text-1">Open</span>
              </div>
              <div
                class="filter-select-btn"
                :class="{ 'filter-select-active': ticketStore.getTicketFilter.closed }"
                @click="getItemByFilters('close')"
              >
                <span class="text-1">Closed</span>
              </div>
            </div>
          </div>
        </div>
        <div
          class="filter-btn"
          :class="{ 'filter-active': ticketStore.getTicketFilter.mentionedMe }"
          @click="getItemByFilters('mention')"
        >
          <Icon icon="at|svg" class="filter-icon" :size="16" sizeType="px" />
          <div class="filter-text">
            <span class="text-1">Mentioned me</span>
          </div>
        </div>
        <div
          class="filter-btn"
          :class="{ 'filter-active': ticketStore.getTicketFilter.createdByMe }"
          @click="getItemByFilters('create')"
        >
          <Icon icon="post|svg" class="filter-icon" :size="16" sizeType="px" />
          <div class="filter-text">
            <span class="text-1">Created by me</span>
          </div>
        </div>
      </div>
      <div class="flex items-center">
        <a-input
          placeholder="Search"
          size="large"
          allowClear
          class="service-ticket-search"
          @change="searchTicket"
        >
          <template #suffix>
            <div class="ticket-input-search-icon">
              <Icon icon="search_v4|svg" style="color: #fff" :size="16" sizeType="px" />
            </div>
          </template>
        </a-input>

        <div class="add-btn-px service-ticket-add" @click="openAddTicketModal()">
          <div class="text-left"> Add </div>
          <div class="text-icon">
            <img class="text-icon-img" :src="add_v4" :alt="add_v4" />
          </div>
        </div>
      </div>
    </div>
    <div class="service-ticket-divider"></div>
    <div class="service-ticket-container">
      <div
        class="flex justify-between ticket-item w-full"
        v-for="item in ticketList"
        :key="item.workOrderId"
        @click="toTicketDetail(item.workOrderId)"
      >
        <img
          class="service-ticket-image"
          v-if="computeImg(item.associationList).status"
          :src="computeImg(item.associationList).imageSrc"
        />
        <div class="service-ticket-info">
          <div class="flex items-center justify-between">
            <div class="service-ticket-info-tl">
              <div class="mb-2 ticket-title">{{ item.title }}</div>
              <div class="flex items-center">
                <span class="avater">
                  {{ item.creatorName[0].toUpperCase() }}
                </span>
                <div class="color-b font-12 ml-1">{{ item.creatorName }}</div>
                <div class="color-808080 font-12 weight-400 ml-1">posted</div>
                <div class="color-b font-12 ml-1">{{ fromNowFormat(item.createTime) }}</div>
                <span class="avater ml-3">
                  {{ item.lastReplyName[0].toUpperCase() }}
                </span>
                <div class="color-b font-12 ml-1">{{ item.lastReplyName }}</div>
                <div class="color-808080 font-12 weight-400 ml-1">commented</div>
                <div class="color-b font-12 ml-1">{{ fromNowFormat(item.lastReplyTime) }}</div>
              </div>
            </div>
            <div class="ticket-tip" :style="{ background: item.status ? '#b3b3b3' : '#28cd41' }">
              <div class="color-w font-10 weight-600">
                {{ item.status ? 'CLOSED' : 'ON GOING' }}
              </div>
              <div class="flex items-baseline">
                <div class="color-w font-18 weight-500">{{ item.replyCount }}</div>
                <div class="color-w font-12 weight-500 ml-1">replies</div>
              </div>
            </div>
          </div>
          <div class="ticket-content">{{ item.content }} </div>
        </div>
      </div>
    </div>

    <AddTicketModal @register="addTicketModal" @ticket-added="handleSearch" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRequest } from 'vue-request';
  import { getServiceTickets } from '/@/api/wattspace/serviceTicket';
  import { useDebounceFn } from '@vueuse/core';
  import { useUserStore } from '/@/store/modules/user';
  import { useTicketStore } from '/@/store/modules/ticket';
  import add_v4 from '@/assets/svg/add_v4.svg';
  import { fromNowFormat } from '/@/utils/dateUtil';
  import { useModal } from '@/components/DeskModal';
  import AddTicketModal from '@/views/modal/add-ticket.vue';

  const { VITE_OSS_DOMAIN } = import.meta.env;
  const go = useGo();
  const userStore = useUserStore();
  const ticketStore = useTicketStore();

  const [addTicketModal, { openModal: openAddTicketModal }] = useModal();

  //分页相关
  const pageSize = ref(10000);
  const total = ref(0);

  ticketStore.fetchOpenTicketCount();

  const toTicketDetail = (ticketId: string) => {
    go(`/serviceTicket/detail/${ticketId}`);
    userStore.fetchUnreadNotification();
  };

  const { run, data } = useRequest(getServiceTickets, {
    manual: false,
    defaultParams: [
      {
        ...ticketStore.getTicketFilter,
        size: pageSize.value,
        status: ticketStore.getTicketStatus,
      },
    ],
    onSuccess: (data) => {
      total.value = data.total;
    },
  });
  const ticketList = computed(() => data.value?.records);

  const handleSearch = () => {
    run({
      ...ticketStore.getTicketFilter,
      size: pageSize.value,
      status: ticketStore.getTicketStatus,
    });
  };

  const searchTicket = useDebounceFn((e) => {
    ticketStore.setTicketFilter({ current: 1, keyword: e.target.value });
    handleSearch();
  }, 500);

  const computeImg = (associationList) => {
    console.log(associationList);
    const images = associationList.filter((res) => res.associationType === 5);
    console.log(images);
    if (!associationList || images.length === 0) {
      return { status: false, imageSrc: '' };
    } else {
      const url = images[0].associationName;
      const imageSrc = `${VITE_OSS_DOMAIN}/${url}`;
      return { status: true, imageSrc };
    }
  };

  const getItemByFilters = (filter: string) => {
    let filterJson: any;
    switch (filter) {
      case 'create':
        filterJson = { createdByMe: !ticketStore.getTicketFilter.createdByMe };
        break;
      case 'mention':
        filterJson = { mentionedMe: !ticketStore.getTicketFilter.mentionedMe };
        break;
      case 'open':
        filterJson = { open: !ticketStore.getTicketFilter.open };
        break;
      case 'close':
        filterJson = { closed: !ticketStore.getTicketFilter.closed };
        break;
    }
    ticketStore.setTicketFilter({
      current: 1,
      keyword: '',
      ...filterJson,
    });
    handleSearch();
  };
</script>
<style lang="less">
  @import url('./index.less');
</style>
