<template>
  <DeskModal
    v-bind="$attrs"
    @register="register"
    :width="1200"
    height="800px"
    :mask-closable="false"
    :footer="null"
    wrapClassName="add-service-ticket-modal"
    title="Add a reply"
    :headerIcon="edit_note_v4"
    :destroyOnClose="true"
    @cancel="handleCancel"
  >
    <div class="add-service-ticket-body">
      <div class="ticket-body-top">
        <div></div>
        <div>
          <a-button title="Mention" type="text">
            <template #icon>
              <Icon icon="ion:at-sharp" size="16" size-type="px" />
            </template>
          </a-button>
          <a-button title="Upload attachments" class="ticket-body-top-middle-icon" type="text">
            <template #icon>
              <Icon icon="mage:attachment" size="16" size-type="px" />
            </template>
          </a-button>
          <Upload :show-upload-list="false" :customRequest="customUpload">
            <a-button title="Upload images" type="text">
              <template #icon>
                <Icon icon="carbon:image" size="16" size-type="px" />
              </template>
            </a-button>
          </Upload>
        </div>
      </div>
      <div class="ticket-body-content">
        <Mentions
          placeholder="Content"
          :bordered="false"
          v-model:value="content"
          autofocus
          rows="16"
          :options="options"
          @select="onSelect"
        ></Mentions>
        <div class="upload-files">
          <ImagePreviewGroup>
            <div class="image" :key="index" v-for="(image, index) in images">
              <Image :height="100" :src="image.src" :previewMask="false" />
              <div class="delete" @click="deleteImg(image)">
                <Icon size="4" icon="close_v4|svg" />
              </div>
            </div>
          </ImagePreviewGroup>

          <div></div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <DeskButton :isIcon="true" px :icon="btn_cancel_v4" @click="cancelFunc" />
      <DeskButton :isIcon="true" px :icon="btn_ok_v4" @click="doneFunc" />
    </div>
  </DeskModal>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { Mentions, ImagePreviewGroup, Image } from 'ant-design-vue';
  import { DeskModal, useModalInner } from '/@/components/DeskModal';
  import Icon from '@/components/Icon/Icon.vue';
  import edit_note_v4 from '@/assets/svg/more_modules_edit_v4.svg';
  import { useRequest } from 'vue-request';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getPlantsForAddTicket } from '/@/api/wattspace/powerStation';
  import btn_cancel_v4 from '@/assets/svg/btn_cancel_v4.svg';
  import btn_ok_v4 from '@/assets/svg/btn_ok_v4.svg';
  import { replyTicket } from '/@/api/wattspace/serviceTicket';
  import { Upload } from 'ant-design-vue';
  import { deleteFile, ossUploadImgForTicket } from '/@/utils/alioss';
  import { remove } from 'lodash-es';

  const content = ref<string>('');
  const plants = ref([]);
  const selectedTicketId = ref();
  // 已上传的图片
  const images = ref<any[]>([]);

  const onSelect = (option: { value: string }) => {
    console.log('select', option);
  };

  const options = [
    {
      value: 'afc163',
      label: 'afc163',
    },
    {
      value: 'zombieJ',
      label: 'zombieJ',
    },
    {
      value: 'yesmeck',
      label: 'yesmeck',
    },
  ];

  const emit = defineEmits(['register', 'comment-added']);

  const [register, { closeModal }] = useModalInner((data) => {
    const { ticketId } = data;
    if (ticketId) {
      selectedTicketId.value = ticketId;
    }
  });
  const { createMessage } = useMessage();

  useRequest(getPlantsForAddTicket, {
    manual: false,
    onSuccess: (data) => {
      //console.log(data);
      plants.value = data.map((res) => ({ label: res.associationName, value: res.associationId }));
    },
  });

  function cancelFunc() {
    closeModal();
  }

  async function doneFunc() {
    const imageList = unref(images).map((res, index) => ({
      associationId: String(index),
      originalContent: res.url,
      associationType: 5,
    }));
    /* const mentionList = unref(mentions).map((res) => ({
        associationId: res.id,
        associationType: res.type === 'user' ? 2 : 3,
      })); */
    const sendData = {
      workOrderId: selectedTicketId.value,
      content: content.value,
      associationList: [...imageList],
    };
    const result = await replyTicket(sendData);
    if (result) {
      //createMessage.success('Submitted');
      closeModal();
      emit('comment-added');
    } else {
      createMessage.error('Submit failed');
    }
    resetModal();
  }

  const resetModal = () => {
    content.value = '';
    images.value = [];
    selectedTicketId.value = null;
  };

  const handleCancel = () => {
    closeModal();
  };

  const deleteImg = (image) => {
    remove(images.value, (res) => {
      return res === image;
    });
    // 删除oss中的内容
    deleteFile(image.url);
  };

  const customUpload = async (e) => {
    const data = await ossUploadImgForTicket(e.file);
    images.value.push(data);
  };
</script>

<style lang="less">
  .add-service-ticket-modal {
    .ant-modal {
      background: rgba(0, 0, 0, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.24);
    }
    .ant-mentions {
      border: none;
      box-shadow: unset;
    }
  }
  .add-service-ticket-body {
    width: 100%;
    height: 600px;
    border-radius: 10px;
    background: #fff;
    margin-top: 20px;
    .ticket-body-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 46px;
      padding: 0 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    }
    .ticket-body-content {
      padding: 10px;
    }
    .ticket-body-top-middle-icon {
      margin: 0 12px;
    }
  }
  .upload-files {
    display: flex;
    padding: 0 5px;
    flex-wrap: wrap;
    overflow: auto;
    height: 110px;

    .image {
      height: 100px;
      cursor: pointer;
      position: relative;
      margin: 5px;
      background: #e2e4ea;
      border-radius: 10px;
      max-width: 120px;
      min-width: 100px;
      object-fit: cover;
      img {
        border-radius: 10px;
        object-fit: contain;
      }
      .delete {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        z-index: 1;
        right: 3px;
        top: 3px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #656566;

        &:hover {
          background: #000;
        }
      }
    }
  }
</style>
