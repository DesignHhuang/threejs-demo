<template>
  <div class="organization">
    <div class="organization__container">
      <div class="sider">
        <div class="sider-item sider-item_active" @click="go('/organization')">
          <div class="flex items-center">
            <img :src="org_active" alt="org_active" />
            <span class="ml-6">My Organization</span>
          </div>
          <Icon class="customer-item-icon" icon="ep:arrow-right-bold" />
        </div>
        <div class="sider-item" @click="go('/organization/customer')">
          <div class="flex items-center">
            <img :src="customer" alt="customer" />
            <span class="ml-6">My Customers</span>
          </div>
          <Icon class="customer-item-icon" icon="ep:arrow-right-bold" />
        </div>
      </div>
      <div class="content">
        <div class="org-info">
          <div class="org-logo"> {{ organization?.companyName[0] }} </div>
          <div class="org-header">
            <div class="org-name" :title="organization?.companyName">
              {{ organization?.companyName }}
            </div>
            <div class="org-code">
              ID: {{ organization?.companyCode }}
              <Icon
                class="ml-2"
                icon="ion:copy"
                color="#B6B7BA"
                @click="copyID(organization?.companyCode)"
                style="cursor: pointer"
              />
            </div>
          </div>
        </div>

        <div class="company-info w-1/2">
          <div class="title">
            MY COMPANY INFO
            <Icon
              v-if="userInfo?.roleFlag === 0"
              :display="userInfo?.roleFlag !== 0 ? 'none' : ''"
              @click="editCompany"
              style="cursor: pointer"
              size="24" size-type="px"
              icon="edit|svg"
            />
          </div>
          <div class="info-items">
            <div class="info-item" v-for="item in orgInfo" :key="item.id">
              <span class="info-item-label">{{ item.title }}</span>
              <span class="info-item-value">
                <div class="overflow" :title="item.value">{{ item.value }}</div>
              </span>
            </div>
          </div>
        </div>

        <div class="account-info">
          <div class="title2">ORGANIZATIONAL MANAGEMENT</div>
          <div class="user-card-list">
            <div v-if="userInfo?.roleFlag === 0" class="user-card-add" @click="handleCreate">
              <Icon icon="ion:add" :size="5" />
            </div>
            <div
              class="user-card"
              :class="{ 'user-card-disabled': !orgUser.status }"
              :key="orgUser.userId"
              v-for="orgUser in orgUsers"
            >
              <div class="user-card-content">
                <div class="more-opt">
                  <Dropdown
                    placement="bottomRight"
                    v-if="userInfo?.roleFlag === 0 || userInfo?.email === orgUser.email"
                  >
                    <a class="ant-dropdown-link" @click.prevent>
                      <Icon icon="uiw:more" />
                    </a>
                    <template #overlay>
                      <Menu
                        v-if="orgUser.email === userInfo.email"
                        @click="(e) => handleMenuClick(e, orgUser)"
                      >
                        <Menu.Item key="0">Edit</Menu.Item>
                      </Menu>
                      <Menu v-else @click="(e) => handleMenuClick(e, orgUser)">
                        <Menu.Item key="0">Edit</Menu.Item>
                        <Menu.Item key="1">{{ orgUser.status ? 'Disable' : 'Activate' }}</Menu.Item>
                        <Menu.Item key="2">Reset password</Menu.Item>
                        <Menu.Item key="3">Authority</Menu.Item>
                        <Menu.Item key="4">Delete</Menu.Item>
                      </Menu>
                    </template>
                  </Dropdown>
                </div>

                <div class="user-card-content_avatar">
                  <div class="user-avatar">
                    {{ orgUser?.name[0].toUpperCase() }}
                  </div>
                </div>

                <div>
                  {{ genders.find((res) => orgUser.sex === res.value).label }} {{ orgUser.name }}
                </div>
                <div class="user-card-content_role">
                  {{ roles.find((res) => orgUser.roleFlag === res.value)?.label }}
                </div>
              </div>

              <div class="info-items">
                <div class="info-item">
                  <span class="info-item-label">Email</span>
                  <div class="info-item-value">
                    <div class="overflow" :title="orgUser.email">{{ orgUser.email }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <span class="info-item-label">Position</span>
                  <div class="info-item-value">
                    <div class="overflow" :title="orgUser.position">
                      {{ orgUser.position ?? '--' }}
                    </div>
                  </div>
                </div>
                <div class="info-item">
                  <span class="info-item-label">Mob.</span>
                  <span class="info-item-value">{{ orgUser.mobile ?? '--' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-item-label">Registration Date</span>
                  <span class="info-item-value">{{
                    formatToDateTime(orgUser.createTime, 'YYYY/MM/DD/HH:mm')
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AccountModal @register="accountModal" @success="handleSuccess" />
    <AuthorityModal @register="authorityModal" @success="handleSuccess" />
    <CompanyModal @register="companyModal" @success="fetchOrganization" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref, ref } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { Dropdown, Menu } from 'ant-design-vue';
  import { useModal } from '@/components/Modal';
  import { useGo } from '/@/hooks/web/usePage';
  import { getOrgInfo, getOrgUsers } from '/@/api/wattspace/system';
  import { useRequest } from 'vue-request';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { genders } from '@/enums/appEnum';
  import { roles } from '@/enums/roleEnum';
  import AccountModal from './AccountModal.vue';
  import AuthorityModal from './AuthorityModal.vue';
  import CompanyModal from './customer/CompanyModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { adminResetPasswordApi, deleteUser, getUserInfo, setUserStatus } from '/@/api/sys/user';
  import { copyText } from '@/utils/copyTextToClipboard';
  import org_active from '@/assets/svg/org_active.svg';
  import customer from '@/assets/svg/customer.svg';

  const go = useGo();
  const [accountModal, { openModal }] = useModal();
  const [authorityModal, { openModal: openAuthorityModal }] = useModal();
  const [companyModal, { openModal: openCompanyModal }] = useModal();
  const { createConfirm } = useMessage();

  const userInfo = ref();

  const handleCreate = () => {
    openModal(true, {
      isUpdate: false,
    });
  };

  const editCompany = () => {
    openCompanyModal(true, {
      companyInfo: organization.value,
      isUpdateCurrentCompany: true,
    });
  };

  const handleResetPass = (userId: string) => {
    createConfirm({
      iconType: 'warning',
      title: 'Do you want to reset password?',
      content: 'The initial password is Watt4freedom!',
      async onOk() {
        await adminResetPasswordApi(userId);
      },
    });
  };

  const handleDisable = (userId: string) => {
    createConfirm({
      iconType: 'warning',
      title: 'Do you want to disable this account?',
      async onOk() {
        await setUserStatus({ userId, status: 0 });
        fetchOrgUsers();
      },
    });
  };

  const handleActive = (userId: string) => {
    createConfirm({
      iconType: 'info',
      title: 'Do you want to active this account?',
      async onOk() {
        await setUserStatus({ userId, status: 1 });
        fetchOrgUsers();
      },
    });
  };

  const handleMenuClick = (e, orgUser) => {
    switch (e.key) {
      case '0':
        handleEdit(orgUser);
        break;
      case '1':
        orgUser.status ? handleDisable(orgUser.userId) : handleActive(orgUser.userId);
        break;
      case '2':
        handleResetPass(orgUser.userId);
        break;
      case '3':
        handleRole(orgUser.userId);
        break;
      case '4':
        handleDelete(orgUser.userId);
        break;
    }
  };

  const handleRole = (userId: string) => {
    openAuthorityModal(true, { userId });
  };

  const handleEdit = (record: Recordable) => {
    openModal(true, {
      record,
      isUpdate: true,
      loginUserId: userInfo?.value.userId,
    });
  };

  const handleDelete = (userId: string) => {
    createConfirm({
      iconType: 'error',
      title: 'Do you want to delete this account?',
      async onOk() {
        await deleteUser(userId);
        fetchOrgUsers();
      },
    });
  };

  const handleSuccess = () => {
    fetchOrgUsers();
  };

  const { run: fetchOrganization, data: organization } = useRequest(getOrgInfo, {
    manual: false,
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const { run: fetchOrgUsers, data: orgUsers } = useRequest(getOrgUsers, {
    manual: false,
    onSuccess: (data) => {
      console.log(data);
      if (!userInfo.value) {
        getUserInfo()
          .then((user) => {
            userInfo.value = user;
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
  });

  const orgInfo = computed(() => [
    {
      id: 1,
      title: 'Create time',
      value: formatToDateTime(unref(organization)?.createTime, 'YYYY/MM/DD/HH:mm'),
    },
    {
      id: 2,
      title: 'Website',
      value: unref(organization)?.website,
    },
    {
      id: 3,
      title: 'Country',
      value: unref(organization)?.regionName,
    },
    {
      id: 4,
      title: 'Address',
      value: unref(organization)?.address,
    },
  ]);

  const copyID = (companyCode) => {
    copyText(companyCode);
  };
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
