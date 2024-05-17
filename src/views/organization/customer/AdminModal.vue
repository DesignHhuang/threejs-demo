<template>
  <BasicModal
    v-bind="$attrs"
    :width="660"
    :footer="null"
    @register="registerModal"
    title="Administrator info"
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
          v-model:value="formState.email"
          disabled="true"
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
      <div class="modal-footer-old">
        <a-button class="modal-cancel mr-4" @click="closeModal">Cancel</a-button>
        <a-button class="modal-save" :loading="loading" @click="submitFunc">Done</a-button>
      </div>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { useFormValid } from '/@/hooks/web/useFormValid';
  import { genders } from '@/enums/appEnum';
  import { updateAdminUser } from '/@/api/wattspace/system';
  import { useRequest } from 'vue-request';

  const emit = defineEmits(['success', 'register']);

  const userId = ref();

  const formRef = ref();
  const { validForm } = useFormValid(formRef);
  const formState = reactive({
    sex: 1,
    name: '',
    email: '',
    position: '',
    mobile: '',
  });

  const [registerModal, { closeModal }] = useModalInner((data) => {
    userId.value = data.adminInfo.userId;
    formState.sex = data.adminInfo.sex;
    formState.name = data.adminInfo.name;
    formState.email = data.adminInfo.email;
    formState.position = data.adminInfo.position;
    formState.mobile = data.adminInfo.mobile;
  });

  const { run, loading } = useRequest(updateAdminUser, {
    onSuccess: (data) => {
      console.log(data);
      closeModal();
      emit('success');
    },
  });

  async function submitFunc() {
    const data = await validForm();
    if (!data) return;
    console.log(data);
    run({ ...data, userId: userId.value });
  }
</script>
