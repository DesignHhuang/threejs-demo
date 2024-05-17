<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :width="660"
    :minHeight="300"
    :mask-closable="false"
    :footer="null"
    title="Firmware Update"
    destroyOnClose
  >
    <div class="upgrade-con">
      <!-- 已经开始升级的展示 -->
      <div v-if="curOpeDevice?.upgradeResult !== null && curOpeDevice?.isStart">
        <div v-if="curOpeDevice?.upgradeResult === 0">
          <Alert
            description="Do not leave this page to perform other operations during the upgrade
      process. Please keep the power supply and communication stable. Interrupting program upgrades
      may cause unpredictable errors."
            type="warning"
            show-icon
            closable
          />
          <div class="e-card playing">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="upgrade-progress">
              <Progress
                strokeColor="#16e630"
                status="active"
                :percent="curOpeDevice?.percent"
                :size="20"
              >
                <template #format="percent">
                  <span style="color: white">{{ percent }}%</span>
                </template>
              </Progress>
            </div>
          </div>
        </div>
        <Result
          v-if="curOpeDevice?.upgradeResult === 1"
          status="success"
          title="Upgrade Successful!"
        />
        <Result
          v-if="curOpeDevice?.upgradeResult === 2"
          status="error"
          title="Upgrade Failed!"
          sub-title="Please check everything is ok and try again later."
        />
      </div>

      <!-- 还没有开始升级时的展示 -->
      <div v-if="curOpeDevice?.upgradeResult !== 0 && !curOpeDevice?.isStart">
        <div class="update-features">
          <!-- {{ description }} -->
          <Badge.Ribbon text="New features">
            <Card
              :title="`Upgrade: ${curOpeDevice?.softwareVersion} to ${latestVersion}`"
              size="small"
            >
              <Space direction="vertical">
                <Badge
                  status="default"
                  :key="index"
                  v-for="(description, index) in descriptions"
                  :text="description"
                />
              </Space>
            </Card>
          </Badge.Ribbon>
        </div>

        <div v-if="showAlert" class="mt-4">
          <Alert
            description="Please confirm that there is stable network and energy before updating. Once the upgrade is interrupted, the upgrade will fail and unpredictable errors will occur."
            type="info"
            show-icon
          >
            <template #action>
              <Space direction="vertical">
                <a-button size="small" type="primary" @click="startUpgrade">Confirm</a-button>
                <a-button size="small" danger type="ghost" @click="showAlert = false"
                  >Cancel</a-button
                >
              </Space>
            </template>
          </Alert>
        </div>

        <div v-else class="modal-footer-old">
          <a-button class="modal-cancel mr-4" @click="closeModal"> Cancel </a-button>
          <a-button class="modal-save" @click="showAlert = true"> Upgrade </a-button>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Alert, Badge, Card, Space, Progress, Result } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getUpgPackageInfo } from '/@/api/wattspace/powerStation';

  const descriptions = ref<string[]>(['No new feature description']);
  const latestVersion = ref<string>('');
  const showAlert = ref(false);

  defineProps({ curOpeDevice: { type: Object } });

  const emit = defineEmits(['start-upgrade', 'register']);

  const [registerModal, { closeModal }] = useModalInner((data) => {
    getUpgPackageInfo(data.modelId).then((res) => {
      if (res) {
        latestVersion.value = res.version;
        if (res.description) {
          descriptions.value = res.description.split('##');
        }
      }
    });
  });

  const startUpgrade = () => {
    emit('start-upgrade');
  };
</script>

<style lang="less" scoped>
  .upgrade-con {
    padding: 0 12px;
  }
  .update-features {
    margin-top: 12px;
  }
  .upgrade-progress {
    width: 400px;
    .ant-progress-text {
      color: #fff !important;
    }
  }

  .e-card {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    position: relative;
    width: 540px;
    height: 200px;
    border-radius: 12px;
    overflow: hidden;
    margin: 12px auto;
  }

  .wave {
    position: absolute;
    width: 700px;
    height: 800px;
    opacity: 0.6;
    left: 0;
    top: 0;
    margin-left: -10%;
    margin-top: -60%;
    background: linear-gradient(744deg, #af40ff, #5b42f3 60%, #00ddeb);
  }

  .wave:nth-child(2),
  .wave:nth-child(3) {
    top: 400px;
  }

  .playing .wave {
    border-radius: 40%;
    animation: wave 3000ms infinite linear;
  }

  .wave {
    border-radius: 40%;
    animation: wave 55s infinite linear;
  }

  .playing .wave:nth-child(2) {
    animation-duration: 4000ms;
  }

  .wave:nth-child(2) {
    animation-duration: 50s;
  }

  .playing .wave:nth-child(3) {
    animation-duration: 5000ms;
  }

  .wave:nth-child(3) {
    animation-duration: 45s;
  }

  @keyframes wave {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
