<template>
  <div class="bound-device-form" v-for="deviceSet in value" :key="deviceSet.key">
    <Icon
      :size="20"
      v-if="value.length > 1"
      class="delete-device-form"
      icon="carbon:close-outline"
      @click="removeDeviceSet(deviceSet.key)"
    />
    <div class="add-sn-row">
      <a-input
        v-model:value="deviceSet.querySn"
        @change="handleDeviceSnChange(deviceSet.querySn)"
        class="add-sn-input"
        placeholder="Please enter SN"
      />
      <Icon
        :size="20"
        v-if="value.length > 1"
        class="delete-device-form"
        icon="carbon:close-outline"
        @click="removeDeviceSet(deviceSet.key)"
      />
    </div>

    <div v-for="sn in deviceSet.devices?.productBriefVoList" :key="sn.productSn" class="add-sn-row">
      <div
        class="add-sn-input"
        style="
          background-color: #00000033;
          border: 1px solid #c0c3d6;
          border-radius: 6px;
          color: #ffffff8c;
        "
      >
        {{ sn.productSn }}
      </div>

      <div class="add-sn-model">
        {{ sn.model }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Form } from 'ant-design-vue';
  import { DeviceSet } from '/#/store';
  import Icon from '@/components/Icon/Icon.vue';
  import { useDebounceFn } from '@vueuse/shared';

  defineProps({
    value: { type: Array as PropType<DeviceSet[]>, default: [] },
  });

  const emit = defineEmits([
    'update:value',
    'removeDeviceSet',
    'addDevice',
    'removeDevice',
    'deviceSnChanged',
  ]);

  Form.useInjectFormItemContext();

  const handleDeviceSnChange = useDebounceFn((deviceSn: string) => {
    emit('deviceSnChanged', deviceSn);
  }, 1000);

  function removeDeviceSet(key: string) {
    emit('removeDeviceSet', key);
    emit('deviceSnChanged');
  }
</script>
