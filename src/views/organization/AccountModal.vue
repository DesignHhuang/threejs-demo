<template>
  <BasicModal
    v-bind="$attrs"
    :width="660"
    :footer="null"
    @register="registerModal"
    :title="getTitle"
  >
    <a-form layout="vertical" ref="formRef" :model="formState">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item name="sex" required hasFeedback>
            <a-select placeholder="* Mr." v-model:value="formState.sex" :options="genders" />
          </a-form-item>
        </a-col>
        <a-col :span="16">
          <a-form-item name="name" required hasFeedback>
            <a-input v-model:value="formState.name" :maxlength="120" placeholder="* Name" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item name="email" required hasFeedback>
        <a-input
          :disabled="isUpdate"
          v-model:value="formState.email"
          :maxlength="120"
          placeholder="* Email"
        />
      </a-form-item>
      <a-form-item name="position" hasFeedback>
        <a-input v-model:value="formState.position" :maxlength="40" placeholder="* Position" />
      </a-form-item>
      <a-form-item name="mobile" required hasFeedback>
        <a-input v-model:value="formState.mobile" :maxlength="16" placeholder="* Mob." />
      </a-form-item>
      <div v-if="!isUpdate" style="margin-bottom: 24px; color: #818792">
        Default account password:
        <span style="color: #2c2d30; background-color: #ddd; border-radius: 10px"
          >&nbsp;Watt4freedom!&nbsp;</span
        >
        <Icon
          icon="copy|svg"
          style="margin-left: 10px; cursor: pointer"
          :size="17"
          @click="copyPwd"
        />
      </div>
    </a-form>
    <div class="modal-footer-old">
      <a-button class="modal-cancel mr-4" @click="cancelFunc">Cancel</a-button>
      <a-button
        class="modal-save"
        :loading="
          isUpdate ? (loginUserId === userId ? editCurrentLoading : editLoading) : addLoading
        "
        @click="submitFunc"
        >Done</a-button
      >
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { genders } from '@/enums/appEnum';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { useRequest } from 'vue-request';
  import { addUser, updateCurrentUser, updateUser } from '/@/api/wattspace/system';
  import { copyText } from '@/utils/copyTextToClipboard';
  import Icon from '@/components/Icon/Icon.vue';

  const emit = defineEmits(['success', 'register']);

  const isUpdate = ref(false);
  let loginUserId = ref();
  const userId = ref('');
  const formRef = ref();
  const { validForm } = useFormValid(formRef);
  const formState = reactive({
    sex: 1,
    name: '',
    email: '',
    position: '',
    mobile: '',
  });

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    isUpdate.value = !!data?.isUpdate;

    loginUserId.value = data.loginUserId;
    if (unref(isUpdate)) {
      userId.value = data.record.userId;
      formState.sex = data.record.sex;
      formState.name = data.record.name;
      formState.email = data.record.email;
      formState.position = data.record.position;
      formState.mobile = data.record.mobile;
    }
  });

  const getTitle = computed(() => (!unref(isUpdate) ? 'Add a new account' : 'Edit account'));

  function cancelFunc() {
    formRef.value.resetFields();
    closeModal();
  }

  const { run, loading: addLoading } = useRequest(addUser, {
    onSuccess: (data) => {
      closeModal();
      emit('success');
    },
  });

  const { run: edit, loading: editLoading } = useRequest(updateUser, {
    onSuccess: (data) => {
      closeModal();
      emit('success');
    },
  });

  const { run: editCurrent, loading: editCurrentLoading } = useRequest(updateCurrentUser, {
    onSuccess: (data) => {
      closeModal();
      emit('success');
    },
  });

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;
    console.log(data);
    if (unref(isUpdate)) {
      loginUserId.value === userId.value
        ? editCurrent({ userId: userId.value, ...data })
        : edit({ userId: userId.value, ...data });
    } else {
      run(data);
    }
  }

  const copyPwd = () => {
    copyText('Watt4freedom!');
  };
</script>
