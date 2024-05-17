<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <img class="w-h-40" :src="note_v4" alt="note_v4" />
        <div class="smallcard1-title">Note</div>
      </div>
      <div class="icon-btn-margin" v-if="!toggleStatus">
        <div class="icon-btn" @click="edit">
          <img class="icon-btn-img edit-icon" :src="edit_v4" alt="edit_v4" />
        </div>
      </div>
    </div>
    <div class="note-con font-b-14-500">
      <div :key="index" v-for="(text, index) in noteText">{{ text }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import note_v4 from '@/assets/svg/note_v4.svg';
  import edit_v4 from '@/assets/svg/edit_v4.svg';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();

  const props = defineProps({
    toggleStatus: { type: Boolean, default: false },
    noteID: { type: String, default: '' },
  });

  const emit = defineEmits(['edit-note']);

  const noteText = computed(() =>
    userStore.getNoteList.find((res) => res.noteId === props.noteID)?.content.split('\n'),
  );

  const edit = () => {
    emit('edit-note', {
      noteID: props.noteID,
      content: userStore.getNoteList.find((res) => res.noteId === props.noteID)?.content,
    });
  };
</script>
<style lang="less" scoped>
  .note-con {
    padding: 0.625rem 1.25rem 1.25rem 1.25rem;
    word-break: break-all;
  }
  .edit-icon {
    width: 1.0625rem;
    height: 0.9375rem;
  }
</style>
