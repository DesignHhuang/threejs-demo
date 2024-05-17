<template>
  <div class="home-page">
    <div id="homePageLeft" class="home-page-left" v-click-outside="handleClickOutside">
      <div class="home-tool" v-if="!toggleStatus">
        <div :key="element.order" v-for="element in cards">
          <moveCard
            :toggleStatus="toggleStatus"
            :order="element.order"
            :type="element.type"
            @editNote="editNote"
            @location="location"
          />
        </div>
      </div>

      <draggable
        v-else
        class="home-tool"
        :list="cards"
        v-bind="dragOptions"
        @start="dragging = true"
        @end="dragging = false"
        item-key="order"
      >
        <template #item="{ element }">
          <div class="list-group-item">
            <moveCard
              :toggleStatus="toggleStatus"
              :order="element.order"
              :type="element.type"
              @move="deleteCard(element.order, element.type)"
              @location="location"
            />
          </div>
        </template>
      </draggable>

      <FadeTransition>
        <div class="more-modules" v-if="toggleStatus">
          <div class="font-b-12-600 title">MORE MODULES</div>
          <div class="more-module-item" @click="openSubscribeModal()">
            <div class="flex items-center">
              <img class="w-h-40" :src="add_plant_v4" alt="add_plant_v4" />
              <div class="font-w-18-600 ml-3">Add a tracking power plant</div>
            </div>
            <div class="icon-btn">
              <img class="icon-btn-img add-icon-img" :src="add_v4" alt="add_v4" />
            </div>
          </div>
          <div class="more-module-item" @click="openModal(true, { update: false })">
            <div class="flex items-center">
              <img class="w-h-40" :src="edit_note_v4" alt="edit_note_v4" />
              <div class="font-w-18-600 ml-3">Add a note</div>
            </div>
            <div class="icon-btn">
              <img class="icon-btn-img add-icon-img" :src="add_v4" alt="add_v4" />
            </div>
          </div>
          <div class="home-tool">
            <div :key="element.order" v-for="element in hiddenCards">
              <moveCard
                mode="add"
                :toggleStatus="toggleStatus"
                :order="element.order"
                :type="element.type"
                @move="addCard(element.order)"
              />
            </div>
          </div>
        </div>
      </FadeTransition>

      <div class="home-page-edit">
        <DeskButton
          :icon="home_config_v4"
          :toggle="true"
          :hoverRotate="true"
          :toggleStatus="toggleStatus"
          @btn-click="handleEdit"
          @toggle="handleSave"
        >
          {{ configText }}
        </DeskButton>
      </div>
    </div>

    <Earth ref="earthRef" @addPlant="addPlant" />

    <!-- home-page-note -->
    <NoteModal
      @register="noteModal"
      v-model:open="noteOpen"
      @add="noteAdded"
      @update="noteUpdated"
    />
    <!-- home-page-subscribe-plant -->
    <SubscribePlant
      @register="subscribePlantModal"
      v-model:open="subscribePlantOpen"
      :subscribedPlants="subscribedPlants"
      @subscribe-plant="subscribePlant"
    />
    <AddPlantModal @register="addPlantModal" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { FadeTransition } from '@/components/Transition';
  import draggable from 'vuedraggable';
  import { useModal } from '@/components/DeskModal';
  import Earth from './components/earth/index.vue';
  import NoteModal from './components/note/index.vue';
  import SubscribePlant from './components/subscribe-plant/index.vue';
  import AddPlantModal from '../plantList_v4/create/index.vue';
  import { remove } from 'lodash-es';
  import home_config_v4 from '@/assets/svg/home_config_v4.svg';
  import moveCard from './components/move-card.vue';
  import add_plant_v4 from '@/assets/svg/more_modules_plant_v4.svg';
  import edit_note_v4 from '@/assets/svg/more_modules_edit_v4.svg';
  import add_v4 from '@/assets/svg/add_v4.svg';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRequest } from 'vue-request';
  import { getHomePageCards, updateHomePageCards } from '/@/api/wattspace/powerStation';
  import { useUserStore } from '/@/store/modules/user';
  import vClickOutside from '@/directives/clickOutside';

  type CardInterface = {
    order: string;
    type: string;
  };

  const userStore = useUserStore();
  const earthRef = ref();
  // 是否有弹窗存在，如果弹窗存在，点击工具栏外面的时候不保存页面配置
  const noteOpen = ref(false);
  const subscribePlantOpen = ref(false);
  const hasModalOpend = computed(() => noteOpen.value || subscribePlantOpen.value);
  // 需要展示的卡片数组
  const cards = ref<CardInterface[]>([]);
  // 需要收纳的卡片数组
  const hiddenCards = ref<CardInterface[]>([]);
  const subscribedPlants = computed(() =>
    cards.value.filter((res) => res.type === 'plant').map((res) => res.order),
  );

  const subscribePlant = (plantID: string) => {
    cards.value.push({ order: plantID, type: 'plant' });
    updateCards({ usedCards: cards.value, unusedCards: hiddenCards.value });
  };

  const noteAdded = (noteID: string) => {
    cards.value.push({ order: noteID, type: 'note' });
    updateCards({ usedCards: cards.value, unusedCards: hiddenCards.value });
  };

  const noteUpdated = () => {
    userStore.getNotes({
      noteIds: cards.value.filter((res) => res.type === 'note').map((res) => res.order),
    });
  };

  useRequest(getHomePageCards, {
    manual: false,
    onSuccess: (data) => {
      const { usedCards, unusedCards } = data;
      cards.value = usedCards ? usedCards : [];
      hiddenCards.value = unusedCards ? unusedCards : [];
      //获取 notes 信息
      const noteIds = cards.value.filter((res) => res.type === 'note').map((res) => res.order);
      if (noteIds.length > 0) {
        userStore.getNotes({
          noteIds,
        });
      }
    },
  });

  const { run: updateCards } = useRequest(updateHomePageCards);

  // 在需要展示的地方删除，收纳的地方新增
  const deleteCard = (order: string, type: string) => {
    const card = unref(cards).find((res) => res.order === order);
    remove(cards.value, (res) => res.order === order);
    if (type !== 'note' && type !== 'plant') {
      card && hiddenCards.value.push(card);
    }
  };

  const addCard = (order: string) => {
    const card = unref(hiddenCards).find((res) => res.order === order);
    remove(hiddenCards.value, (res) => res.order === order);
    card && cards.value.push(card);
  };

  const dragging = ref(false);
  const toggleStatus = ref(false);
  const configText = computed(() => (unref(toggleStatus) ? 'Save' : 'Edit'));
  const dragOptions = {
    animation: 200,
    disabled: false,
    ghostClass: 'ghost',
  };

  const go = useGo();
  const [noteModal, { openModal }] = useModal();
  const [subscribePlantModal, { openModal: openSubscribeModal }] = useModal();
  const [addPlantModal, { openModal: openAddPlantModal }] = useModal();

  const handleEdit = () => {
    toggleStatus.value = true;
  };

  const handleClickOutside = () => {
    toggleStatus.value && !hasModalOpend.value && handleSave();
  };

  const handleSave = () => {
    // 保存修改的数据
    toggleStatus.value = false;
    updateCards({ usedCards: cards.value, unusedCards: hiddenCards.value });
  };

  const addPlant = () => {
    openAddPlantModal(true);
  };

  const editNote = ({ noteID, content }) => {
    openModal(true, {
      update: true,
      id: noteID,
      content,
    });
  };

  const location = (orderId: string) => {
    unref(earthRef).location(orderId);
  };
</script>
<style lang="less">
  @import url('./index.less');

  .home-page-top-tool {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 14px;
    //left: 40rem;
    right: 0;
    width: calc(100% - 40rem);
    z-index: 1;
  }

  .home-page-bottom-tool {
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 1.25rem;
    right: 0;
    width: calc(100% - 40rem);
    z-index: 1;
  }

  .text-icon-img {
    width: 1rem;
    height: 1rem;
  }

  .more-modules {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0.25rem;

    .title {
      width: 37.75rem;
      line-height: 2.5rem;
      padding-left: 1.5rem;
    }
  }

  .more-module-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 5rem;
    padding: 1.25rem;
    width: 37.75rem;
    margin-bottom: 0.625rem;
    border-radius: 1.25rem;
    border: 2px solid rgba(255, 255, 255, 0.6);
    background: #808080;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(45px);
    cursor: pointer;

    &:hover {
      .icon-btn {
        background: #000;
      }
    }
  }

  .smallcard1-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .smallcard1-title {
    color: #000;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 2.5rem;
  }

  .smallcard-echart {
    display: flex;
    align-items: center;
    margin-left: 1rem;
    height: 1.5625rem;
    .smallcard-echart-data {
      display: flex;
      justify-content: space-between;
    }
    .smallcard-echart-item {
      flex: auto;
      margin-left: 0.875rem;
      margin-right: 1.5rem;
    }
  }
</style>
