<template>
  <DeskModal
    v-bind="$attrs"
    @register="registerModal"
    :width="1200"
    :height="'800px'"
    padding="20px"
    :mask-closable="false"
    :footer="null"
    wrapClassName="add-service-ticket-modal"
    title="Service ticket"
    :headerIcon="service_ticket_v4"
    destroyOnClose
    @cancel="closeModal"
  >
    <div class="detail-serviceticket">
      <div class="service-ticket-detail">
        <div class="avater">
          {{ ticketDetail?.creatorName[0].toUpperCase() }}
        </div>
        <div class="w-full">
          <div class="service-ticket-info">
            <div class="flex items-center">
              {{ ticketDetail?.creatorName }}
              <div class="service-ticket-info-post">posted</div>
              <div>{{ fromNowFormat(ticketDetail?.createTime) }}</div>
            </div>
            <div class="flex items-center">
              <div v-if="!ticketDetail?.status" class="ticket-status" @click="changeStatus(1)">
                <span class="begin">ON GOING</span>
                <div class="hover">
                  <div class="hover-mark">MARK AS</div>
                  <div class="hover-text">CLOSED</div>
                </div>
              </div>
              <div v-else class="ticket-status-closed" @click="changeStatus(0)">
                <span class="begin">CLOSED</span>
                <div class="hover">
                  <div class="hover-mark">MARK AS</div>
                  <div class="hover-text">ON GOING</div>
                </div>
              </div>
            </div>
          </div>
          <div class="title" :title="ticketDetail?.title">{{ ticketDetail?.title }}</div>
          <!-- <div>Related plant Wattsonic demo plant</div> -->
          <div class="content">{{ ticketDetail?.content }}</div>

          <div class="flex items-center">
            <div
              class="ticket-detail-img"
              :key="index"
              v-for="(res, index) in filterImages(ticketDetail?.associationList)"
            >
              <Image :height="100" style="border-radius: 10px; object-fit: contain" :src="res" />
            </div>
          </div>
          <div class="service-ticket-info-bottom">
            <div class="flex items-baseline">
              <div class="font-b-20-500 mr-2">{{ ticketDetail?.replyCount }}</div>
              <div class="font-b-14-500">replies</div>
            </div>
            <div class="right">
              <a-button type="text" @click="addApply">Reply</a-button>
            </div>
          </div>
        </div>
      </div>
      <div class="comments">
        <div class="comment-item" :key="comment.workOrderReplyId" v-for="comment in infoList">
          <div class="avater">
            {{ comment?.creatorName[0].toUpperCase() }}
          </div>
          <div class="w-full">
            <div class="service-ticket-info">
              <div class="flex items-center">
                {{ comment?.creatorName }}
                <div class="service-ticket-info-post">commented</div>
                <div>{{ fromNowFormat(comment?.createTime) }}</div>
              </div>
              <!-- <a-button type="text">Reply</a-button> -->
            </div>

            <div class="content editor-content-view" v-html="comment.replyContent"> </div>

            <div class="flex items-center">
              <div
                class="ticket-detail-img"
                :key="index"
                v-for="(res, index) in filterImages(comment?.associationList)"
              >
                <Image :height="100" style="border-radius: 10px; object-fit: contain" :src="res" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="add-apply">
        <img class="add-apply-img" :src="fuckyou" alt="fuckyou" @click="addApply" />
      </div>
    </div>

    <AddTicketComment @register="addTicketCommentModal" @comment-added="addComment" />
  </DeskModal>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRequest } from 'vue-request';
  import { Image } from 'ant-design-vue';
  import { getReplyList, getTicketDetail, setTicketStatus } from '/@/api/wattspace/serviceTicket';
  import { DeskModal, useModalInner, useModal } from '/@/components/DeskModal';
  import service_ticket_v4 from '@/assets/svg/service_ticket_v4.svg';
  import { fromNowFormat } from '/@/utils/dateUtil';
  import { drop } from 'lodash-es';
  import fuckyou from '@/assets/svg/fuckyou.svg';
  import AddTicketComment from './add-ticket-comment.vue';

  const { VITE_OSS_DOMAIN } = import.meta.env;
  const emit = defineEmits(['register', 'update-reply']);

  const selectedTicketId = ref();

  const [addTicketCommentModal, { openModal: openTicketCommentModal }] = useModal();
  const [registerModal, { closeModal }] = useModalInner((data) => {
    const { ticketId } = data;
    if (ticketId) {
      selectedTicketId.value = ticketId;
      fetchDetail(ticketId);
      run(ticketId);
    }
  });

  const { run: fetchDetail, data: detail } = useRequest(getTicketDetail);
  const { run, data } = useRequest(getReplyList);
  // 回复列表
  const infoList = computed(() => {
    if (data.value && data.value.length > 0) {
      const replies: any[] = drop(data.value);
      return replies.map((res) => ({
        ...res,
        avatar: res.creatorName[0],
      }));
    } else {
      return [];
    }
  });

  const ticketDetail = computed(() =>
    data.value ? { ...detail.value, ...data.value[0] } : detail.value,
  );

  const filterImages = (associationList) => {
    if (associationList && associationList.length > 0) {
      const images = associationList.filter((res) => res.associationType === 5);
      return images.map((res) => `${VITE_OSS_DOMAIN}/${res.associationName}`);
    } else {
      return [];
    }
  };

  const addApply = () => {
    openTicketCommentModal(true, { ticketId: selectedTicketId.value });
  };

  const addComment = () => {
    fetchDetail(selectedTicketId.value);
    run(selectedTicketId.value);
    emit('update-reply');
  };

  const changeStatus = (status: number) => {
    setStatus({ workOrderId: selectedTicketId.value, status: status });
  };

  const { run: setStatus } = useRequest(setTicketStatus, {
    onSuccess: (_) => {
      fetchDetail(selectedTicketId.value);
    },
  });
</script>

<style lang="less" scoped>
  .avater {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    line-height: 40px;
    font-size: 15px;
    color: #ffffff;
    background-image: url('/src/assets/svg/avater_bg_v4.svg');
    background-repeat: no-repeat;
    background-size: contain;
    margin-right: 10px;
  }
  .service-ticket-detail {
    display: flex;
    padding: 30px 50px 6px 50px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }
  .service-ticket-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
  }
  .service-ticket-info-post {
    margin-left: 6px;
    margin-right: 6px;
  }
  .comments {
    padding: 10px 50px;
    flex: auto;
    overflow: auto;
  }
  .comment-item {
    display: flex;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }
  .hover-mark {
    color: #fff;
    font-size: 8px;
    font-weight: 600;
    line-height: 12px;
  }
  .hover-text {
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    line-height: 12px;
  }
  .ticket-status {
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #28cd41;
    width: 96px;
    height: 30px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    line-height: 30px;
    cursor: pointer;
    .hover {
      display: none;
    }

    &:hover {
      background: #808080;

      .begin {
        display: none;
      }
      .hover {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .ticket-status-closed {
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #808080;
    width: 96px;
    height: 30px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    line-height: 30px;
    cursor: pointer;
    .hover {
      display: none;
    }

    &:hover {
      background: #28cd41;
      .begin {
        display: none;
      }
      .hover {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    }
  }
  .add-apply {
    display: flex;
    justify-content: center;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(30px);

    .add-apply-img {
      cursor: text;
    }
  }

  .title {
    color: #000000;
    font-size: 30px;
    max-width: 800px;
    margin-top: 6px;
    line-height: 45px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .content {
    margin-top: 12px;
    margin-bottom: 10px;
  }
  .ticket-detail-img {
    border-radius: 10px;
    margin-right: 10px;
    max-width: 120px;
    height: 100px;
    object-fit: contain;
  }
  .service-ticket-info-bottom {
    margin-top: 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .right {
      display: flex;
      align-items: center;
    }
  }

  .detail-serviceticket {
    display: flex;
    height: 736px;
    flex-direction: column;
    margin: auto;
    border-radius: 20px 20px 0 0;
    background: #fff;
    position: relative;
    justify-content: space-between;
  }
</style>
