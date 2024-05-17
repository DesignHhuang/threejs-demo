<template>
  <div>
    <div class="smallcard1-top">
      <div class="flex items-center">
        <img class="w-h-40" :src="service_ticket_v4" alt="service_ticket_v4" />
        <div class="smallcard1-title">SERVICE TICKET</div>
      </div>
      <div class="icon-btn-margin" v-if="!toggleStatus">
        <div class="icon-btn" @click="toTicket">
          <img
            class="icon-btn-img service-ticket-detail"
            :src="service_ticket_detail_v4"
            alt="service_ticket_detail_v4"
          />
        </div>
      </div>
    </div>

    <div class="service-ticket-info">
      <div @click="toTotalTicket" class="cursor-p">
        <span class="font-b-34-600">{{ ticketStore.getOpenTicketCount.allCount }}</span>
        <span class="font-b-12-500 ml-1">in total</span>
      </div>
      <div @click="toFocusTicket" class="cursor-p ml-5">
        <span class="font-b-34-600">{{ ticketStore.getOpenTicketCount.mentionedMeCount }}</span>
        <span class="font-b-12-500 ml-1">need focus</span>
      </div>
    </div>

    <div class="service-ticket-avatars">
      <div
        class="avatar font-w-15-500"
        :title="avator"
        :key="index"
        v-for="(avator, index) in ticketStore.getOpenTicketCount.latestReplyAvator"
      >
        {{ avator[0] }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useGo } from '/@/hooks/web/usePage';
  import { useTicketStore } from '/@/store/modules/ticket';
  import service_ticket_v4 from '@/assets/svg/service_ticket_v4.svg';
  import service_ticket_detail_v4 from '@/assets/svg/service_ticket_detail_v4.svg';

  defineProps({ toggleStatus: { type: Boolean, default: false } });

  const ticketStore = useTicketStore();
  const go = useGo();

  ticketStore.fetchOpenTicketCount();
  const goServiceTicket = (filter: any) => {
    ticketStore.setTicketFilter(filter);
    go('/serviceTicket/index');
  };

  const toTotalTicket = () => {
    goServiceTicket({
      mentionedMe: false,
      createdByMe: false,
      open: true,
      closed: false,
      keyword: '',
      current: 1,
    });
  };

  const toFocusTicket = () => {
    goServiceTicket({
      mentionedMe: true,
      createdByMe: false,
      open: false,
      closed: false,
      keyword: '',
      current: 1,
    });
  };

  const toTicket = () => {
    goServiceTicket({
      mentionedMe: false,
      createdByMe: false,
      open: true,
      closed: true,
      keyword: '',
      current: 1,
    });
  };
</script>
<style lang="less" scoped>
  .service-ticket-info {
    margin: 1.25rem 1.25rem 0.625rem 1.25rem;
    height: 2.625rem;
    display: flex;
    align-items: center;
  }
  .service-ticket-avatars {
    display: flex;
    margin-left: 2rem;
  }
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    background: #a7a7a7;
    border-radius: 50%;
    margin-left: -0.75rem;
    border: 1px solid #ffffff;
    scale: 1;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      scale: 1.1;
      z-index: 1;
    }
  }
  .service-ticket-detail {
    height: 1.375rem;
    width: 1.375rem;
  }
</style>
