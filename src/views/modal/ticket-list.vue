<template>
  <DeskModal
    v-bind="$attrs"
    @register="registerModal"
    :width="1200"
    :height="800"
    padding="20px"
    :mask-closable="false"
    :footer="null"
    wrapClassName="add-service-ticket-modal"
    title="Service ticket"
    :headerIcon="service_ticket_v4"
    destroyOnClose
    @cancel="closeModal"
  >
    <div class="service-ticket-toolbar">
      <div class="flex items-center">
        <div
          class="filter-dropdown"
          :class="{ 'filter-dropdown-active': getTicketStatusText !== 'All' }"
        >
          <div class="filter-dropdown-content">
            <div class="filter-select">
              <Icon icon="status|svg" class="filter-icon" size="16" sizeType="px" />
              <div class="filter-select-text">
                <span class="text-1">{{ getTicketStatusText }} status</span>
              </div>
              <Icon icon="ep:arrow-down-bold" style="color: #808080" size="16" sizeType="px" />
            </div>

            <div class="filter-select-popover">
              <div
                class="filter-select-btn"
                :class="{ 'filter-select-active': filterJson.open }"
                @click="getItemByFilters('open')"
              >
                <span class="text-1">Open</span>
              </div>
              <div
                class="filter-select-btn"
                :class="{ 'filter-select-active': filterJson.closed }"
                @click="getItemByFilters('close')"
              >
                <span class="text-1">Closed</span>
              </div>
            </div>
          </div>
        </div>
        <div
          class="filter-btn"
          :class="{ 'filter-active': filterJson.mentionedMe }"
          @click="getItemByFilters('mention')"
        >
          <Icon icon="at|svg" class="filter-icon" size="16" sizeType="px" />
          <div class="filter-text">
            <span class="text-1">Mentioned me</span>
          </div>
        </div>
        <div
          class="filter-btn"
          :class="{ 'filter-active': filterJson.createdByMe }"
          @click="getItemByFilters('create')"
        >
          <Icon icon="post|svg" class="filter-icon" size="16" sizeType="px" />
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
              <Icon icon="search_v4|svg" style="color: #fff" :size="1" />
            </div>
          </template>
        </a-input>

        <div class="add-btn-px service-ticket-add" @click="addTicket">
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
              <div class="ticket-title">{{ item.title }}</div>
              <div class="flex items-center">
                <span class="avater">
                  {{ item.creatorName[0].toUpperCase() }}
                </span>
                <div class="creator-name">{{ item.creatorName }}</div>
                <div class="posted">posted</div>
                <div class="time">{{ fromNowFormat(item.createTime) }}</div>
                <span class="avater ml-3">
                  {{ item.lastReplyName[0].toUpperCase() }}
                </span>
                <div class="creator-name">{{ item.lastReplyName }}</div>
                <div class="posted">commented</div>
                <div class="time">{{ fromNowFormat(item.lastReplyTime) }}</div>
              </div>
            </div>
            <div class="ticket-tip" :style="{ background: item.status ? '#b3b3b3' : '#28cd41' }">
              <div class="top">{{ item.status ? 'CLOSED' : 'ON GOING' }}</div>
              <div class="flex items-baseline">
                <div class="b-l">{{ item.replyCount }}</div>
                <div class="b-r">replies</div>
              </div>
            </div>
          </div>
          <div class="ticket-content">{{ item.content }} </div>
        </div>
      </div>
    </div>
    <AddTicketModal
      @register="addTicketModal"
      @ticket-added="run({ ...filterJson, status: ticketStatus })"
    />
    <TicketDetailModal @register="ticketDetailModal" @update-reply="updateReply" />
  </DeskModal>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { useRequest } from 'vue-request';
  import { getServiceTickets } from '/@/api/wattspace/serviceTicket';
  import { useDebounceFn } from '@vueuse/core';
  import add_v4 from '@/assets/svg/add_v4.svg';
  import { DeskModal, useModalInner, useModal } from '/@/components/DeskModal';
  import { useUserStore } from '/@/store/modules/user';
  import service_ticket_v4 from '@/assets/svg/service_ticket_v4.svg';
  import { fromNowFormat } from '/@/utils/dateUtil';
  import AddTicketModal from './add-ticket.vue';
  import TicketDetailModal from './ticket-detail.vue';

  const { VITE_OSS_DOMAIN } = import.meta.env;
  const emit = defineEmits(['register', 'update-reply']);

  const userStore = useUserStore();
  const selectedPlantId = ref();

  const [addTicketModal, { openModal: openAddTicketModal }] = useModal();
  const [ticketDetailModal, { openModal: openTicketDetailModal }] = useModal();

  const addTicket = () => {
    openAddTicketModal(true, {
      plantId: selectedPlantId.value,
    });
  };

  const toTicketDetail = (ticketId: string) => {
    openTicketDetailModal(true, {
      ticketId,
    });
    userStore.fetchUnreadNotification();
  };

  const filterJson = reactive({
    current: 1,
    size: 10000,
    keyword: '',
    plantId: selectedPlantId,
    mentionedMe: false,
    createdByMe: false,
    open: true,
    closed: false,
  });

  const ticketStatus = computed(() => {
    // 0:open 1:closed null:all
    if (filterJson.open === filterJson.closed) {
      return null;
    } else {
      return filterJson.open ? 0 : 1;
    }
  });
  const getTicketStatusText = computed(() => {
    if (filterJson.open === filterJson.closed) {
      return filterJson.open ? 'Open, Closed' : 'All';
    } else {
      return filterJson.open ? 'Open' : 'Closed';
    }
  });

  const { run, data } = useRequest(getServiceTickets);
  const ticketList = computed(() => data.value?.records);

  const [registerModal, { closeModal }] = useModalInner((data) => {
    const { plantId } = data;
    if (plantId) {
      selectedPlantId.value = plantId;
      run({ ...filterJson, status: ticketStatus.value });
    }
  });

  const computeImg = (associationList) => {
    const images = associationList.filter((res) => res.associationType === 5);
    if (!associationList || images.length === 0) {
      return { status: false, imageSrc: '' };
    } else {
      const url = images[0].associationName;
      const imageSrc = `${VITE_OSS_DOMAIN}/${url}`;
      return { status: true, imageSrc };
    }
  };

  const handleSearch = () => {
    run({ ...filterJson, status: ticketStatus.value });
  };

  const updateReply = () => {
    emit('update-reply');
    run({ ...filterJson, status: ticketStatus });
  };

  const searchTicket = useDebounceFn((e) => {
    filterJson.keyword = e.target.value;
    handleSearch();
  }, 500);

  const getItemByFilters = (filter: string) => {
    switch (filter) {
      case 'create':
        filterJson.createdByMe = !filterJson.createdByMe;
        break;
      case 'mention':
        filterJson.mentionedMe = !filterJson.mentionedMe;
        break;
      case 'open':
        filterJson.open = !filterJson.open;
        break;
      case 'close':
        filterJson.closed = !filterJson.closed;
        break;
    }
    handleSearch();
  };
</script>

<style lang="less" scoped>
  .service-ticket-toolbar {
    width: 1130px;
    height: 50px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .service-ticket-image {
    width: 70px;
    background: #000000d4;
    border-radius: 10px;
    object-fit: contain;
  }
  .service-ticket-search {
    width: 360px;
    padding: 0 0 0 12px;
    border-radius: 10px;
    border: 1px solid #ffffff7d;
    background: rgba(0, 0, 0, 0.03);
  }
  .ticket-input-search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    margin: 6px;
  }
  .service-ticket-add {
    height: 42px;
    border: 1px solid #ffffff7d;
    background: rgba(0, 0, 0, 0.03);
    backdrop-filter: unset;
  }
  .service-ticket-divider {
    width: 100%;
    height: 1px;
    background: rgba(0, 0, 0, 0.2);
  }

  .service-ticket-container {
    padding-top: 10px;
    width: 1130px;
    margin: auto;
    height: 685px;
    overflow: auto;
  }

  .service-ticket-info {
    margin-left: 10px;
    flex: 1;
  }

  .ticket-tip {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 96px;
    height: 42px;
    border-radius: 10px;
    padding: 5px 10px;
    margin-right: 10px;
    color: #fff;
    .top {
      font-size: 10px;
      font-weight: 600;
    }
    .b-l {
      font-size: 18px;
      font-weight: 500;
      line-height: 18px;
    }
    .b-r {
      font-size: 12px;
      font-weight: 400;
      margin-left: 2px;
    }
  }
  .service-ticket-info-tl {
    max-width: 800px;
    .creator-name {
      color: #000;
      font-size: 12px;
      margin-left: 4px;
    }
    .posted {
      color: rgba(0, 0, 0, 0.6);
      font-size: 12px;
      font-weight: 400;
      margin-left: 4px;
    }
    .time {
      color: rgba(0, 0, 0, 0.6);
      font-size: 12px;
      font-weight: 500;
      margin-left: 4px;
    }
  }

  .filter-icon {
    fill: #000;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    border-radius: 15px;
    height: 30px;
    padding: 0 12px;
    margin-right: 8px;
    cursor: pointer;
  }

  .filter-dropdown {
    height: 30px;
    margin-right: 8px;
  }
  .filter-dropdown-content {
    border-radius: 15px;
    height: 30px;
    overflow: hidden;
    padding: 0 12px;
    position: relative;
    z-index: 1;
    transition: height 0.25s;

    &:hover {
      height: 103px;
    }
  }
  .filter-select {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30px;
    cursor: default;
  }
  .filter-text {
    display: flex;
    flex-direction: column;
    margin-left: 6px;
  }
  .filter-select-text {
    margin-right: 6px;
    margin-left: 6px;
  }
  .filter-select-popover {
    border-radius: 10px;
    background: #cdcdcd;
    padding: 5px 6px 2px 6px;
  }
  .filter-select-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    height: 30px;
    border-radius: 10px;
    margin-bottom: 3px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  }

  .text-1 {
    color: #808080;
    font-size: 14px;
  }
  .filter-select-active {
    background: rgba(0, 0, 0, 0.2);

    .text-1 {
      color: #000;
    }
  }
  .filter-dropdown-active {
    position: relative;
    &::after {
      position: absolute;
      content: '';
      height: 3px;
      background: #000;
      width: 106%;
      bottom: -12px;
      left: -3px;
    }
    .text-1 {
      color: #000;
    }
  }
  .filter-active {
    background: rgba(0, 0, 0, 0.2);
    position: relative;

    &::after {
      position: absolute;
      content: '';
      height: 3px;
      background: #000;
      width: 106%;
      bottom: -12px;
      left: -3px;
    }

    .text-1 {
      color: #000;
    }
  }

  .open-ticket {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    border: 1px solid #f4f5f7;
    background: #e2e4ea;
    height: 40px;
    padding: 0px 16px;
    font-size: 12px;
    margin-left: 8px;
    color: #5b6577;
    cursor: pointer;
  }

  .ticket-item {
    margin: 10px 0;
    border-radius: 20px;
    background: #fff;
    padding: 10px;
    cursor: pointer;
    height: 115px;
  }
  .avater {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 12px;
    color: #ffffff;
    background-image: url('/src/assets/svg/avater_bg_v4.svg');
    background-repeat: no-repeat;
    background-size: contain;
  }
  .ticket-content {
    margin-top: 6px;
    color: #000;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;

    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 这里是超出几行省略 */
    overflow: hidden;
  }
  .ticket-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #000;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
  }
</style>
