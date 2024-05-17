<template>
  <div class="organization">
    <div class="organization__container">
      <div class="sider">
        <div class="sider-item sider-item-org" @click="go('/organization')">
          <img :src="org" alt="org" />
          <span class="ml-6">My Organization</span>
          <Icon class="customer-item-icon" icon="ep:arrow-right-bold" />
        </div>
        <div class="sider-item sider-item_customer_active" @click="go('/organization/customer')">
          <img :src="customer_active" alt="customer_active" />
          <span class="ml-6">My Customers</span>
          <Icon class="customer-item-icon" icon="ep:arrow-right-bold" />
        </div>
      </div>
      <div class="content flex w-full">
        <div class="customer-list">
          <div class="add-customer" @click="handleCreate">
            <Icon icon="ion:add" :size="2" />
          </div>
          <div
            class="customer-item"
            :class="{ 'customer-item-activity': company.companyId === currentCompany?.companyId }"
            :key="company.companyId"
            v-for="company in companys"
            @click="selectCom(company)"
            style="cursor: pointer"
          >
            <div class="company-avator" :style="{ backgroundColor: getRandomCompanyColor() }">
              {{ company.companyName[0].toUpperCase() }}
            </div>
            <div
              class="customer-item-info"
              :class="{ 'customer-info-activity': company.companyId === currentCompany?.companyId }"
            >
              <div class="company-name">
                <div class="company-name-over" :title="company.companyName">{{
                  company.companyName
                }}</div>
                <div>ID: {{ company.companyCode }}</div>
              </div>

              <Icon class="customer-item-icon" icon="ep:arrow-right-bold" />
            </div>
          </div>
        </div>

        <div class="customer-company" v-if="currentCompany">
          <div class="org-info">
            <div class="org-logo"> {{ currentCompany.companyName[0] }} </div>
            <div class="org-header">
              <div class="org-name" :title="currentCompany.companyName">{{
                currentCompany.companyName
              }}</div>
              <div class="org-code"> ID: {{ currentCompany.companyCode }} </div>
            </div>
          </div>
          <div class="title">
            MY COMPANY INFO
            <Icon @click="modifyCompanyInfo" style="cursor: pointer" size="2" icon="edit|svg" />
          </div>
          <div class="info-items">
            <div class="info-item">
              <span class="info-item-label">Create time</span>
              <span class="info-item-value">{{
                formatToDateTime(currentCompany?.createTime, 'YYYY/MM/DD/HH:mm')
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-item-label">Website</span>
              <span class="info-item-value">
                <div class="overflow" :title="currentCompany.website">{{
                  currentCompany.website
                }}</div>
              </span>
            </div>
            <div class="info-item">
              <span class="info-item-label">Country</span>
              <span class="info-item-value">{{ currentCompany.regionName }}</span>
            </div>
            <div class="info-item">
              <span class="info-item-label">Address</span>
              <span class="info-item-value">{{ currentCompany.address }}</span>
            </div>
          </div>
          <div class="title">
            ADMINISTRATOR INFO
            <Icon @click="modifyAdminInfo" style="cursor: pointer" size="2" icon="edit|svg" />
          </div>
          <div class="info-items">
            <div class="info-item">
              <span class="info-item-label">Name</span>
              <span class="info-item-value"
                ><div class="overflow" :title="currentAdmin?.name">{{
                  currentAdmin?.name
                }}</div></span
              >
            </div>
            <div class="info-item">
              <span class="info-item-label">Email</span>
              <span class="info-item-value"
                ><div class="overflow" :title="currentAdmin?.email">{{
                  currentAdmin?.email
                }}</div></span
              >
            </div>
            <div class="info-item">
              <span class="info-item-label">Position</span>
              <span class="info-item-value"
                ><div class="overflow" :title="currentAdmin?.position">{{
                  currentAdmin?.position
                }}</div></span
              >
            </div>
            <div class="info-item">
              <span class="info-item-label">Mob.</span>
              <span class="info-item-value">{{ currentAdmin?.mobile }}</span>
            </div>
            <div class="info-item">
              <span class="info-item-label">Registration Date</span>
              <span class="info-item-value">{{
                formatToDateTime(currentCompany?.createTime, 'YYYY/MM/DD/HH:mm')
              }}</span>
            </div>
          </div>
          <div class="copy-info" @click="showCopyModal">Copy</div>
        </div>
      </div>
    </div>

    <CreateCustomer @register="createCustomerModal" @add-success="createCustomerSuccess" />
    <CompanyModal @register="companyModal" @success="run" />
    <AdminModal @register="adminModal" @success="run" />
    <CopyModal @register="copyModal" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { useModal } from '@/components/Modal';
  import CreateCustomer from '../create-customer/CreateModal.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import CompanyModal from './CompanyModal.vue';
  import AdminModal from './AdminModal.vue';
  import CopyModal from './CopyModal.vue';
  import { useRequest } from 'vue-request';
  import { getRelationCompany, getSubCompany } from '/@/api/wattspace/system';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { getRandomCompanyColor } from '@/utils/color';
  import org from '@/assets/svg/org.svg';
  import customer_active from '@/assets/svg/customer_active.svg';

  const go = useGo();
  const [createCustomerModal, { openModal }] = useModal();
  const [companyModal, { openModal: openCompanyModal }] = useModal();
  const [adminModal, { openModal: openAdminModal }] = useModal();
  const [copyModal, { openModal: openCopyModal }] = useModal();

  const currentCompany = ref<any>();
  const currentAdmin = ref<any>();
  const showCurrent = ref(false);

  const createCustomerSuccess = () => {
    run();
  };

  const handleCreate = () => {
    openModal(true);
  };

  const showCopyModal = () => {
    openCopyModal(true, {
      companyInfo: currentCompany.value,
      adminInfo: currentAdmin.value,
    });
  };

  const modifyCompanyInfo = () => {
    openCompanyModal(true, {
      companyInfo: currentCompany.value,
      isUpdateCurrentCompany: false,
    });
  };

  const modifyAdminInfo = () => {
    openAdminModal(true, {
      adminInfo: currentAdmin.value,
    });
  };

  const { run: getCurrentCompany } = useRequest(getSubCompany, {
    onSuccess: (data) => {
      console.log(data);
      currentCompany.value = data.company;
      currentAdmin.value = data.admin;
    },
  });

  const { run, data: relationCompany } = useRequest(getRelationCompany, {
    manual: false,
    onSuccess: (data) => {
      if (data.subordinateCompany.length > 0) {
        showCurrent.value = true;
        const companyId = unref(currentCompany)
          ? unref(currentCompany).companyId
          : data.subordinateCompany[0].companyId;
        getCurrentCompany(companyId);
      } else {
        showCurrent.value = false;
      }
    },
  });

  const selectCom = (company) => {
    getCurrentCompany(company.companyId);
  };
  const companys = computed(() => relationCompany.value?.subordinateCompany);
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
