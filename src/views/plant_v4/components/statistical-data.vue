<template>
  <div class="statistical-data">
    <div class="card-name">
      <span>Statistical Data</span>
    </div>
    <div class="saving">
      <div class="saving-icon">
        <img class="tree" :src="TreeSaving" />
      </div>
      <div class="saving-trees">
        <div class="data-item">
          <span class="data">{{ overview?.dioxide }} kg</span>
          <span class="label">CO₂ EMISSION</span>
          <span class="label">REDUCTION</span>
        </div>
        <div class="data-item">
          <span class="data">{{ overview?.trees }} trees</span>
          <span class="label">EQUIVALENT</span>
          <span class="label">TREES PLANTED</span>
        </div>
        <div class="data-item">
          <span class="data">{{ overview?.carbons }} kg</span>
          <span class="label">COAL</span>
          <span class="label">SAVINGS</span>
        </div>
      </div>
    </div>
    <div class="saving">
      <div class="saving-icon">
        <img class="power" :src="PowerSaving" />
      </div>
      <div class="saving-power">
        <div class="title">TOTAL/TODAY</div>
        <div class="data-item">
          <span class="data">
            {{ overview?.totalCharge }} kWh / {{ overview?.todayTotalCharge }} kWh
          </span>
          <span class="label">Battery charged</span>
        </div>
        <div class="data-item">
          <span class="data">
            {{ overview?.totalDischarge }} kWh / {{ overview?.todayTotalDischarge }} kWh
          </span>
          <span class="label">Battery discharged</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import TreeSaving from '@/assets/svg/tree-saving.svg';
  import PowerSaving from '@/assets/svg/power-saving.svg';

  defineProps({ overview: { type: Object, default: () => {} } });
</script>

<style lang="less" scoped>
  .statistical-data {
    width: 38.125rem;
    height: 25rem;
    border-radius: 1.25rem;
    border: 2px solid rgba(0, 0, 0, 0.04);
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(30px);
    padding: 0.625rem;
  }
  .saving {
    display: flex;
    align-items: center;
    padding: 0 0 0 1.25rem;
  }
  .saving-icon {
    width: 5.625rem;
    height: 5.625rem;
    min-width: 5.625rem;
    min-height: 5.625rem;
    background: #e2e4ea;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    .tree {
      margin-right: 0.1875rem;
      width: 3.875rem;
    }
    .power {
      margin-left: 1.125rem;
      width: 3.5rem;
    }
  }
  .saving-trees {
    display: flex;
    flex: auto;
    align-items: center;
    border-bottom: 2px solid #e2e4ea;
    margin: 0 0 0 1.875rem;
    padding: 1.875rem 0;
  }

  .data-item {
    display: flex;
    flex-direction: column;
    margin-right: 1.875rem;
    .data {
      color: #2c2d30;
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.1875rem;
    }
    .label {
      color: #5bca44;
      font-size: 0.75rem;
      font-weight: 600;
    }
  }

  .saving-power {
    display: flex;
    flex-direction: column;
    margin: 0 0 0 1.875rem;
    padding: 1.875rem 0;
    .title {
      color: #818792;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .data-item {
      margin-top: 0.3125rem !important;
    }
    .data {
      margin-bottom: unset !important;
    }
  }
</style>
