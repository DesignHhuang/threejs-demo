<template>
  <div class="overview-service-ticket" @click="openListModal">
    <div class="card-name">
      <div class="flex items-center">
        <img class="w-h-40" :src="service_ticket_v4" alt="service_ticket_v4" />
        <div class="smallcard1-title">SERVICE TICKET</div>
      </div>
      <div class="icon-btn" @click.stop="openListModal">
        <img class="add-icon-img" :src="fullscreen_v4" alt="fullscreen_v4" />
      </div>
    </div>
    <!-- addTicket -->
    <div class="add-ticket" v-if="ticketList && ticketList.length > 0" @click.stop="addTicket">
      <img class="add-icon-img" :src="add_v4" alt="add_v4" />
    </div>
    <div
      class="service-tickets service-tickets-nodata"
      v-if="!ticketList || ticketList.length === 0"
    >
      <img
        class="nodate"
        :key="i"
        v-for="i in 4"
        :src="service_ticket_nodata_v4"
        alt="service_ticket_nodata_v4"
      />
      <div class="service-tickets-nodata-btn">
        <WattButton width="13.125rem" :icon="add_v4" @click.stop="addTicket">
          Add a service ticket
        </WattButton>
      </div>
    </div>
    <div v-else class="service-tickets">
      <div
        class="ticket-item"
        v-for="ticket in ticketList"
        :key="ticket.workOrderId"
        style="cursor: pointer"
        @click.stop="toTicketDetail(ticket.workOrderId)"
      >
        <div class="ticket-top">
          <div class="title">{{ ticket.title }}</div>
          <div class="desc">{{ ticket.content }}</div>
        </div>
        <div class="ticket-bottom">
          <div>
            <div class="flex items-center">
              <span class="avater">
                {{ ticket.creatorName[0].toUpperCase() }}
              </span>
              <div class="creator-name font-b-10-500">{{ ticket.creatorName }}</div>
              <div class="font-808080-10-400 ml-1">posted</div>
              <div class="font-b-10-500 ml-1">{{ fromNowFormat(ticket.createTime) }}</div>
            </div>
            <div class="flex items-center mt-1">
              <span class="avater">
                {{ ticket.lastReplyName[0].toUpperCase() }}
              </span>
              <div class="creator-name font-b-10-500 ml-1">{{ ticket.lastReplyName }}</div>
              <div class="font-808080-10-400 ml-1">commented</div>
              <div class="font-b-10-500 ml-1">{{ fromNowFormat(ticket.lastReplyTime) }}</div>
            </div>
          </div>
          <div class="ticket-tip">
            <div class="font-w-9-600">ON GOING</div>
            <div class="flex items-baseline">
              <div class="font-w-12-500">{{ ticket.replyCount }}</div>
              <div class="font-w-10-500 ml-1">replies</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AddTicketModal @register="addTicketModal" @ticket-added="run(defaultParams)" />

    <TicketListModal @register="ticketListModal" @update-reply="run(defaultParams)" />

    <TicketDetailModal @register="ticketDetailModal" @update-reply="run(defaultParams)" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useRequest } from 'vue-request';
  import { getServiceTickets } from '/@/api/wattspace/serviceTicket';
  import { useModal } from '@/components/DeskModal';
  import { useUserStore } from '/@/store/modules/user';
  import service_ticket_v4 from '@/assets/svg/service_ticket_v4.svg';
  import add_v4 from '@/assets/svg/add_v4.svg';
  import fullscreen_v4 from '@/assets/svg/fullscreen_v4.svg';
  import service_ticket_nodata_v4 from '@/assets/svg/service_ticket_nodata_v4.svg';
  import AddTicketModal from '@/views/modal/add-ticket.vue';
  import TicketListModal from '@/views/modal/ticket-list.vue';
  import TicketDetailModal from '@/views/modal/ticket-detail.vue';
  import { fromNowFormat } from '/@/utils/dateUtil';

  const props = defineProps({ plantId: { type: String, default: '' } });
  const userStore = useUserStore();

  const [addTicketModal, { openModal: openAddTicketModal }] = useModal();
  const [ticketListModal, { openModal: openTicketListModal }] = useModal();
  const [ticketDetailModal, { openModal: openTicketDetailModal }] = useModal();

  const addTicket = () => {
    openAddTicketModal(true, {
      plantId: props.plantId,
    });
  };

  const openListModal = () => {
    openTicketListModal(true, {
      plantId: props.plantId,
    });
  };

  const toTicketDetail = (ticketId: string) => {
    openTicketDetailModal(true, {
      ticketId,
    });
    userStore.fetchUnreadNotification();
  };

  const defaultParams = { current: 1, size: 4, plantId: props.plantId, status: 0 };

  // 获取tickets信息
  const serviceTicketTotal = ref(0);

  const { run, data: ticketRes } = useRequest(getServiceTickets, {
    manual: false,
    defaultParams: [defaultParams],
    onSuccess: (data) => {
      serviceTicketTotal.value = data.total;
    },
  });
  const ticketList = computed(() => ticketRes.value?.records);

  /* const addTicket = () => {
    console.log('在电站中添加工单');
    go(`/serviceTicket/create/${props.plantId}/00/plant`);
  }; */
</script>

<style lang="less" scoped>
  .overview-service-ticket {
    display: flex;
    flex-direction: column;
    width: 38.125rem;
    margin-right: 1rem;
    height: 25rem;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 1.25rem;
    border: 2px solid rgba(255, 255, 255, 0.6);
    background: rgba(0, 0, 0, 0.08);
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(45px);

    .nodate {
      margin-top: 0.625rem;
      width: 49%;
      height: 10rem;
    }
  }
  .add-icon-img {
    height: 0.875rem;
    width: 0.875rem;
  }
  .add-ticket {
    display: flex;
    margin: 0 0.625rem;
    align-items: center;
    justify-content: center;
    height: 2.5rem;
    cursor: pointer;
    border-radius: 0.625rem;
    background: rgba(0, 0, 0, 0.08);
  }
  .service-tickets {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 0 0.625rem;
    overflow-x: hidden;
  }
  .service-tickets-nodata {
    position: relative;
    overflow: hidden;
    flex: 1;
  }
  .service-tickets-nodata-btn {
    display: flex;
    justify-content: center;
    bottom: 1rem;
    width: 100%;
    position: absolute;
  }

  .ticket-top {
    flex: 1;
    padding: 1rem 0.625rem;
  }

  .ticket-bottom {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3rem;
    padding: 0.25rem 0;
    margin: 0 0.625rem;
    border-top: 1px solid rgba(0, 0, 0, 0.2);

    &::before {
      position: absolute;
      top: -8px;
      left: -18px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgb(226 226 228);
      content: '';
    }

    &::after {
      position: absolute;
      top: -8px;
      right: -18px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgb(226 226 228);
      content: '';
    }
  }

  .ticket-tip {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 4.375rem;
    height: 2.125rem;
    border-radius: 5px;
    background: #28cd41;
    padding: 0.25rem;
  }

  .ticket-item {
    margin-top: 0.625rem;
    background: #fff;
    width: 49%;
    height: 10rem;
    border-radius: 0.625rem;
    display: flex;
    flex-direction: column;
    .creator-name {
      max-width: 3.125rem;
      margin-left: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .title {
      color: #000;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .desc {
      margin-top: 0.5rem;
      color: #000;
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1rem;

      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3; /* 这里是超出几行省略 */
      overflow: hidden;
    }

    .avater {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      line-height: 1.25rem;
      font-size: 0.75rem;
      color: #ffffff;
      background-image: url('/src/assets/svg/avater_bg_v4.svg');
      background-repeat: no-repeat;
      background-size: contain;
    }
  }
</style>
