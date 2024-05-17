<template>
  <PageWrapper :breadcrumbs="breadcrumbs" contentClass="plantDetailNoBottom">
    <div class="segmented">
      <div class="to-page" @click="go(`/plantList/${plantID}/overview`)">
        <Icon icon="overview|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Overview</span>
      </div>
      <div class="to-page" style="margin: auto 10px" @click="go(`/plantList/${plantID}/device`)">
        <Icon icon="device|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Device</span>
      </div>
      <div class="to-page active plant-detail-active" @click="go(`/plantList/${plantID}/info`)">
        <Icon icon="plantinfo|svg" :size="18" sizeType="px" style="margin-right: 5px" />
        <span style="margin-left: 5px">Plant info</span>
      </div>
    </div>

    <div class="desk-plantinfo-detail">
      <div class="desk-plantinfo-detail-header" v-show="false">
        <div class="desk-plantinfo-plant-title">
          <div class="desk-plantinfo-plant-avator">W</div>
          <div class="desk-plantinfo-plant-name">Wattsonic demo plant</div>
          <Icon icon="focus_active_v4|svg" size="2.5" />
        </div>
        <div class="plant-detail-edit"></div>
      </div>

      <div class="ownerinfo">
        <img class="user-img" :src="headerImg" />
        <div class="top-info">
          <div class="plant-name">{{ plantBasicInfo?.plantName }}</div>
          <span class="flex items-center mt-4">
            <span class="ownerinfo-title">OWNER INFO</span>
            <span class="ownerinfo-item">
              <Icon icon="mdi:user" size="2" color="#5B6577" style="margin-right: 6px" />
              {{ plantBasicInfo?.ownerName }}
            </span>
            <span class="ownerinfo-item" v-if="plantBasicInfo?.ownerPhone"
              ><Icon
                icon="bi:telephone-fill"
                size="2"
                color="#5B6577"
                style="margin-right: 6px"
              />{{ plantBasicInfo?.ownerPhone }}</span
            >
            <span class="ownerinfo-item"
              ><Icon
                icon="clarity:email-solid"
                size="2"
                color="#5B6577"
                style="margin-right: 6px"
              />{{ plantBasicInfo?.contactInfo }}</span
            >
          </span>
        </div>
      </div>
      <div class="bot-info">
        <div class="w-1/2">
          <div class="info-title mb-3">
            <span>PLANT INFO</span>
            <span
              v-if="
                userStore.getPermitsList.filter(
                  (res) => res.name === 'Edit plant info' && res.isGranted === true,
                ).length > 0
              "
              @click="openEditDevice"
              style="cursor: pointer"
            >
              <Icon size="2" icon="edit|svg" />
            </span>
          </div>
          <div class="info-items" style="margin-right: 12px">
            <div class="info-item" v-for="(item, index) in plantInfo" :key="index">
              <span class="info-item-label">{{ item.title }}</span>
              <span class="info-item-value" :class="{ 'value-tag': item.isTag }">{{
                item.value
              }}</span>
            </div>
          </div>
        </div>
        <div class="w-1/2">
          <div class="info-title mb-3">ORGANIZER INFO</div>
          <div class="info-items" style="margin-left: 12px">
            <div class="info-item" v-for="(item, index) in orgInfo" :key="index">
              <span class="info-item-label">{{ item.title }}</span>
              <span class="info-item-value" :class="{ 'value-tag': item.isTag }">{{
                item.value
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <EditPlantModal @register="editPlantModal" @edit-plant-info-success="loadPlantInfo" />
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { PageWrapper } from '@/components/Page';
  import { useRequest } from 'vue-request';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { getPlantInfo } from '/@/api/wattspace/powerStation';
  import headerImg from '/@/assets/images/header.png';
  import { useRoute } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';
  import { useModal } from '/@/components/Modal';
  import EditPlantModal from './components/editPlantInfo/index.vue';
  import { useUserStore } from '/@/store/modules/user';

  const route = useRoute();
  const go = useGo();
  const userStore = useUserStore();
  let plantID = route.params.plantId as string;

  const [editPlantModal, { openModal }] = useModal();

  const openEditDevice = () => {
    openModal(true, {
      plantID: plantID,
      currentZone: plantBasicInfo.value.timezone,
    });
  };

  let plantBasicInfo = ref();
  const loadPlantInfo = () => {
    useRequest(getPlantInfo, {
      manual: false,
      defaultParams: [plantID],
      onSuccess(data) {
        plantBasicInfo.value = data;
      },
    });
  };

  onMounted(() => {
    loadPlantInfo();
  });
  const breadcrumbs = computed(() => [
    {
      path: '/plantList/index',
      name: 'Plant List',
    },
    {
      name: `${plantBasicInfo.value?.plantName} plant info`,
    },
  ]);

  //const utcOffset = dayjs().utcOffset() / 60;
  const plantInfo = computed(() => [
    {
      id: 1,
      title: 'Creation time',
      isTag: false,
      value: formatToDateTime(plantBasicInfo.value?.createTime),
    },
    { id: 2, title: 'Country/Region', isTag: true, value: plantBasicInfo.value?.regionName },
    {
      id: 3,
      title: 'Timezone',
      isTag: true,
      value: plantBasicInfo.value?.timezone,
    },
    {
      id: 4,
      title: 'Address',
      isTag: false,
      value: plantBasicInfo.value?.address,
    },
  ]);
  const orgInfo = computed(() => [
    /* {
      id: 1,
      title: 'Distributor',
      isTag: false,
      value: plantBasicInfo.value?.dealerName,
    }, */
    {
      id: 2,
      title: 'Installer',
      isTag: false,
      value: plantBasicInfo.value?.installerName,
    },
  ]);
</script>

<style lang="less">
  .desk-plantinfo-detail {
    margin: auto;
    padding: 10px;

    .desk-plantinfo-detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
    }
    .desk-plantinfo-plant-title {
      display: flex;
      align-items: center;
    }
    .desk-plantinfo-plant-avator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: url('@/assets/svg/company_avator_bg_v4.svg');
      background-size: contain;
      color: #ffffff;
      line-height: 36px;
    }

    .desk-plantinfo-plant-name {
      color: #000;
      font-size: 26px;
      font-weight: 600;
      line-height: 40px;
      margin-left: 12px;
      margin-right: 10px;
    }

    .bot-info {
      width: 1200px;
      margin: auto;
      display: flex;
      margin-top: 20px;
    }
    .ownerinfo {
      border-radius: 20px;
      margin: auto;
      background: #f4f5f7;
      padding: 20px 0 20px 30px;
      display: flex;
      .ownerinfo-title {
        color: #5b6577;
        font-size: 14px;
        font-weight: 600;
      }
      .ownerinfo-item {
        color: #2c2d30;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        margin-left: 60px;
      }

      .top-info {
        display: flex;
        flex-direction: column;
        flex: auto;
      }
      .plant-name {
        color: #2c2d30;
        font-size: 30px;
        font-weight: 600;
        border-bottom: 2px solid #e2e4ea;
        padding-bottom: 20px;
      }
    }

    .info-title {
      margin-left: 42px;
      margin-right: 42px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #2c2d30;
      font-size: 12px;
      font-weight: 600;
    }
    .info-items {
      border-radius: 20px;
      background: #f4f5f7;
      padding-left: 42px;

      .info-item {
        height: 54px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #e2e4ea;

        &:last-child {
          border-bottom: unset;
        }
        .info-item-label {
          color: #5b6577;
          font-size: 14px;
          font-weight: 500;
        }
        .info-item-value {
          display: flex;
          align-items: center;
          margin-right: 42px;
          color: #2c2d30;
          font-size: 14px;
          font-weight: 500;
          max-width: 240px;
          text-align: right;
        }
        .value-tag {
          background: #e2e4ea;
          border-radius: 15px;
          height: 23px;
          padding: 0 12px;
        }
      }
    }
    .user-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 16px;
    }
  }
</style>
