<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :footer="null" title="Authority">
    <div>
      <Checkbox
        v-model:checked="checkAll"
        :indeterminate="indeterminate"
        @change="onCheckAllChange"
      >
        Check all
      </Checkbox>
    </div>
    <CheckboxGroup class="role-group" v-model:value="checkedList" :options="permits" />
    <div class="modal-footer-old">
      <a-button class="modal-cancel mr-4" @click="closeModal">Cancel</a-button>
      <a-button class="modal-save" :loading="loading" @click="submitFunc">Done</a-button>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, unref, watch } from 'vue';
  import { Checkbox, CheckboxGroup } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { configPermits, getUserPermits } from '/@/api/sys/user';
  import { useRequest } from 'vue-request';

  const emit = defineEmits(['success', 'register']);

  const userId = ref();
  const checkAll = ref(false);
  const permits = ref();
  const indeterminate = ref(true);
  const checkedList = ref<any[]>([]);

  const onCheckAllChange = (e: any) => {
    checkedList.value = e.target.checked ? permits.value.map((res) => res.permitId) : [];
    indeterminate.value = false;
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    userId.value = data?.userId;
    const result = await getUserPermits(data?.userId);
    permits.value = result.map((res) => ({ ...res, value: res.permitId, label: res.name }));
    checkedList.value = permits.value.filter((res) => res.isGranted).map((res) => res.permitId);
  });

  watch(
    () => checkedList.value,
    (val) => {
      indeterminate.value = !!val.length && val.length < permits.value.length;
      checkAll.value = val.length === permits.value.length;
    },
  );

  const { run, loading } = useRequest(configPermits, {
    onSuccess: (data) => {
      console.log(data);
      closeModal();
    },
  });

  const submitFunc = () => {
    const grantedList = permits.value.map((res) => ({
      permitId: res.permitId,
      isGranted: unref(checkedList).includes(res.permitId) ? true : false,
    }));
    run({ userId: userId.value, grantedList });
  };
</script>

<style lang="less" scoped>
  .role-group {
    display: flex;
    flex-direction: column;
  }
</style>
