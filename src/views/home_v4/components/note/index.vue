<template>
  <DeskModal
    v-bind="$attrs"
    padding="20px"
    :width="600"
    @register="registerModal"
    title="Note"
    :headerIcon="edit_note_v4"
    :help-message="'Take record and get a easier access on the homepage.'"
    destroyOnClose
    @ok="handleOk"
    :confirmLoading="isUpdate ? updateLoading : addLoading"
  >
    <template #title v-if="isUpdate"></template>
    <a-textarea
      style="margin-top: 0.6rem; margin-bottom: 0.25rem"
      v-model:value="contentText"
      :maxlength="500"
      showCount
      :auto-size="{ minRows: 12, maxRows: 20 }"
    />
  </DeskModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { DeskModal, useModalInner } from '/@/components/DeskModal';
  import edit_note_v4 from '@/assets/svg/more_modules_edit_v4.svg';
  import { useRequest } from 'vue-request';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { addNote, updateNote } from '/@/api/wattspace/powerStation';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();

  const noteID = ref('');
  const contentText = ref('');
  const isUpdate = ref(false);

  const emit = defineEmits(['register', 'add', 'update']);

  const [registerModal, { closeModal }] = useModalInner((data) => {
    const { update, content, id } = data;
    isUpdate.value = update;
    if (isUpdate.value) {
      noteID.value = id;
      contentText.value = content;
    }
  });
  const { createMessage } = useMessage();

  const { run: add, loading: addLoading } = useRequest(addNote, {
    onSuccess: (data) => {
      emit('add', data);
      createMessage.success('Add note success');
      userStore.addNote({ noteId: data, content: contentText.value });
      contentText.value = '';
      closeModal();
    },
  });

  const { run: update, loading: updateLoading } = useRequest(updateNote, {
    onSuccess: (_) => {
      emit('update');
      createMessage.success('Update note success');
      contentText.value = '';
      closeModal();
    },
  });

  const handleOk = () => {
    isUpdate.value
      ? update({ noteId: noteID.value, content: contentText.value })
      : add({ content: contentText.value });
  };

  /* const pressEnter = () => {
    contentText.value = `${contentText.value}###`;
  }; */
</script>

<style lang="less">
  .create-plant-note {
    color: #818792;
    font-size: 14px;
    font-weight: 400;
  }

  .ant-input {
    &:hover {
      border-color: #000000;
      box-shadow: unset;
    }
    &:focus {
      border-color: #000000;
      box-shadow: unset;
    }
  }
</style>
