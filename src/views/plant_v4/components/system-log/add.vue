<template>
  <DeskModal
    v-bind="$attrs"
    @register="register"
    :width="1200"
    height="800px"
    :mask-closable="false"
    :footer="null"
    wrapClassName="add-service-ticket-modal"
    title="Add a new system log"
    :headerIcon="edit_note_v4"
    destroyOnClose
    @cancel="handleCancel"
  >
    <div class="add-service-ticket-body">
      <div class="ticket-body-top">
        <div></div>
        <div>
          <!-- <a-button title="Mention" type="text">
            <template #icon>
              <Icon icon="ion:at-sharp" />
            </template>
          </a-button> -->
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
      <div class="ticket-body-title">
        <a-input v-model:value="title" :bordered="false" size="large" placeholder="Title" />
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
      <DeskButton :isIcon="true" px :icon="btn_ok_v4" @click="handleSubmit" />
    </div>
  </DeskModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { DeskModal, useModalInner } from '@/components/DeskModal';
  import { addServiceLog } from '/@/api/wattspace/system';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Mentions, ImagePreviewGroup, Image } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import edit_note_v4 from '@/assets/svg/more_modules_edit_v4.svg';
  import btn_cancel_v4 from '@/assets/svg/btn_cancel_v4.svg';
  import btn_ok_v4 from '@/assets/svg/btn_ok_v4.svg';
  import { Upload } from 'ant-design-vue';
  import { deleteFile, ossUploadImgForSystemLog } from '/@/utils/alioss';
  import { remove } from 'lodash-es';

  const plantId = ref();
  const title = ref<string>('');
  const content = ref<string>('');
  // 已上传的图片
  const images = ref<any[]>([]);

  const emit = defineEmits(['register', 'addSuccess']);

  const { createMessage } = useMessage();
  const [register, { closeModal }] = useModalInner((data) => {
    plantId.value = data.plantId;
    console.log(plantId.value);
  });

  const disabledSumbit = computed(() => content.value === '<p><br></p>');

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

  function cancelFunc() {
    closeModal();
  }

  const deleteImg = (image) => {
    remove(images.value, (res) => {
      return res === image;
    });
    // 删除oss中的内容
    deleteFile(image.url);
  };

  const customUpload = async (e) => {
    const data = await ossUploadImgForSystemLog(e.file);
    images.value.push(data);
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleSubmit = async () => {
    if (disabledSumbit.value) {
      return;
    }
    // type 1是图片 2是文件
    const imageList = unref(images).map((res, index) => ({
      name: String(index),
      url: res.url,
      type: 1,
    }));
    /* const mentionList = unref(mentions).map((res) => ({
        associationId: res.id,
        associationType: res.type === 'user' ? 2 : 3,
      })); */
    const sendData = {
      plantId: plantId.value,
      logLevel: 'SERVICE',
      logName: title.value,
      logDesc: content.value,
      appendixList: [...imageList],
    };
    // 工单提交
    console.log(sendData);
    //addServiceLog
    const data = await addServiceLog(sendData);
    console.log(data);
    if (data.msg === 'Success') {
      closeModal();
      emit('addSuccess');
    } else {
      createMessage.error('Submit failed');
    }
  };
</script>

<style lang="less" scoped>
  .add-log-input {
    margin-bottom: 12px;
    width: 100%;
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

    .submit {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 12px;
      width: 200px;
      height: 40px;
      border-radius: 30px;
      color: #f4f5f7;
      font-size: 16px;
      cursor: pointer;
      background: linear-gradient(225deg, #077deb 0%, #3df9d8 100%);
    }
    .submit-disabled {
      background: #9e9e9e;
      cursor: not-allowed;
    }
  }
</style>
