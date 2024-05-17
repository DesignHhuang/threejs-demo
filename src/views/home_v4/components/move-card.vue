<template>
  <!-- @mousemove="(e) => mousemove(e, order)" @mouseleave="mouseleave(order)" -->
  <div :id="order" :class="className">
    <ScaleTransition>
      <div class="icon-btn card-delete-btn" v-if="toggleStatus" @click="moveCard">
        <img class="icon-btn-img" :class="`${mode}-icon-img`" :src="add_v4" alt="add_v4" />
      </div>
    </ScaleTransition>
    <totalPlant v-if="type === 'totalPlant'" />
    <serviceTicket v-if="type === 'serviceTicket'" :toggleStatus="toggleStatus" />
    <installation v-if="type === 'install'" />
    <topProduct v-if="type === 'product'" />
    <saving v-if="type === 'savings'" />
    <topSellers v-if="type === 'topSellers'" />
    <topPlants v-if="type === 'topPlants'" />
    <note
      v-if="type === 'note'"
      :noteID="order"
      :toggleStatus="toggleStatus"
      @edit-note="editNote"
    />
    <weather v-if="type === 'weather'" :toggleStatus="toggleStatus" />
    <plant v-if="type === 'plant'" :plantId="order" @location="location" />
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { ScaleTransition } from '@/components/Transition';
  import totalPlant from './cards/total-plant.vue';
  import serviceTicket from './cards/service-ticket.vue';
  import installation from './cards/installation.vue';
  import topProduct from './cards/top-product.vue';
  import saving from './cards/saving.vue';
  import weather from './cards/weather.vue';
  import topSellers from './cards/top-sellers.vue';
  import topPlants from './cards/top-plants.vue';
  import note from './cards/note.vue';
  import plant from './cards/plant.vue';
  import add_v4 from '@/assets/svg/add_v4.svg';

  const props = defineProps({
    toggleStatus: { type: Boolean, default: false },
    mode: { type: String, default: 'delete' },
    type: { type: String, default: '' },
    order: { type: String, default: '' },
  });

  const emit = defineEmits(['move', 'editNote', 'location']);

  const className = computed(() => {
    let names = '';
    switch (props.type) {
      case 'totalPlant':
        names = 'home-tool-total-plant card-border-6';
        break;
      case 'serviceTicket':
      case 'install':
      case 'product':
      case 'savings':
        names = 'home-tool-small-card1 card-border-4';
        break;
      case 'topSellers':
      case 'topPlants':
        names = 'home-tool-small-card2 card-border-6';
        break;
      case 'note':
        names = 'home-tool-note-card card-border-4';
        break;
      case 'weather':
        names = 'home-tool-weather-card card-border-4';
        break;
      case 'plant':
        names = 'home-tool-plant-card';
        break;
    }
    return names;
  });

  const moveCard = () => {
    emit('move');
  };

  const editNote = (data) => {
    emit('editNote', data);
  };

  const location = () => {
    emit('location', props.order);
  };

  /* const mousemove = (e, order: string) => {
    const el = document.getElementById(order);
    if (el) {
      const box = el.getBoundingClientRect();
      const width = box.width / 2;
      const height = box.height / 2;
      const offsetwidth = (e.clientX - box.x - width) / 100;
      const offsetheight = (e.clientY - box.y - height) / 100;
      el.setAttribute('style', `transform:translate3d(${offsetwidth}px, ${offsetheight}px, 0)`);
    }
  };
  const mouseleave = (order: string) => {
    const el = document.getElementById(order);
    el && el.setAttribute('style', 'transform:translate3d(0, 0, 0)');
  }; */
</script>

<style lang="less" scoped>
  .add-icon-img {
    width: 1rem;
    height: 1rem;
  }
</style>
