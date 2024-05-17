<template>
  <div>
    <div class="flex items-center justify-between h-40">
      <div class="font-w-12-600 ml-5">{{ address }}</div>
      <div class="icon-btn-margin" v-if="!toggleStatus">
        <div class="icon-btn" @click="refresh">
          <img class="icon-btn-img" :src="weather_refresh_v4" alt="weather_refresh_v4" />
        </div>
      </div>
    </div>
    <div class="weather-con">
      <div>
        <div class="font-w-40-600">{{ weatherInfo?.weatherCurrent?.temperature }}º</div>
        <div class="font-w-16-600">{{ weatherInfo?.weatherCurrent?.weatherDesc ?? 'No Data' }}</div>
      </div>
      <div>
        <div
          v-for="weather in weatherInfo?.weatherDailyList"
          :key="weather.date"
          :class="[weather.week === 'YDY' ? 'font-w-12-600-6' : 'font-w-12-600']"
          class="weather-item flex"
        >
          <div class="weather-day">{{ weather.week }}</div>
          <Icon class="weather-icon" :icon="weatherIcon(weather)" />
          {{ weather.minTemperature }}°
          <div class="weather-degree">
            <div
              class="weather-degree-detail"
              :style="compute(weather.minTemperature, weather.maxTemperature)"
            ></div>
          </div>
          {{ weather.maxTemperature }}°
        </div>

        <!-- <div class="weather-item font-w-12-600-6 flex">
          <div class="weather-day">YDY</div>
          <Icon class="weather-icon" icon="sun_v4|svg" />
          23°
          <div class="weather-degree"></div>
          28°
        </div>
        <div class="weather-item font-w-12-600 flex">
          <div class="weather-day">SAT</div>
          <Icon class="weather-icon" icon="cloudy_v4|svg" />
          25° <div class="weather-degree"></div>31°
        </div>
        <div class="weather-item font-w-12-600 flex">
          <div class="weather-day">SUN</div>
          <Icon class="weather-icon" icon="cloudy_v4|svg" />
          26°<div class="weather-degree"></div> 29°
        </div>
        <div class="weather-item font-w-12-600 flex">
          <div class="weather-day">MON</div>
          <Icon class="weather-icon" icon="sun_v4|svg" />
          24°<div class="weather-degree"></div> 30°
        </div>
        <div class="weather-item font-w-12-600 flex">
          <div class="weather-day">TUE</div>
          <Icon class="weather-icon" icon="sun_v4|svg" />
          22°<div class="weather-degree"></div> 31°
        </div> -->
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import Icon from '@/components/Icon/Icon.vue';
  import { useRequest } from 'vue-request';
  import weather_refresh_v4 from '@/assets/svg/weather_refresh_v4.svg';
  import { getWeatherByLocation } from '/@/api/wattspace/powerStation';
  import { ref } from 'vue';
  import { WeatherDailyVo, WeatherDataVo } from '/@/api/wattspace/model/powerStationModel';
  import { max, min } from 'lodash-es';
  import { getOrgInfo } from '/@/api/wattspace/system';

  defineProps({ toggleStatus: { type: Boolean, default: false } });

  const weatherInfo = ref<WeatherDataVo>();
  const perTemp = ref(1);
  const weatherDailymin = ref(0);
  const address = ref('');

  const { run } = useRequest(getOrgInfo, {
    manual: false,
    onSuccess: (data) => {
      address.value = `${data.address} (${data.regionName})`;
      getWeatherByLocation({ latitude: data.latitude, longitude: data.longitude }).then((res) => {
        weatherInfo.value = res;
        const weatherDailyList = res.weatherDailyList;
        weatherDailymin.value = min(weatherDailyList.map((res) => res.minTemperature)) as number;
        const weatherDailymax = max(weatherDailyList.map((res) => res.maxTemperature));
        perTemp.value = 100 / (Number(weatherDailymax) - Number(weatherDailymin.value));
      });
    },
  });

  const compute = (minTemperature, maxTemperature) => {
    const left = (minTemperature - weatherDailymin.value) * perTemp.value;
    const right = (maxTemperature - weatherDailymin.value) * perTemp.value;
    return { left: `${left}%`, width: `${right - left}%` };
  };

  const weatherIcon = (weather: WeatherDailyVo) => {
    return weather.weatherCode + '|svg';
  };

  const refresh = () => {
    run();
  };
</script>
<style lang="less" scoped>
  .weather-con {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    .weather-item {
      height: 1.3125rem;
      align-items: center;
    }
    .weather-degree {
      position: relative;
      height: 0.25rem;
      width: 12.1875rem;
      background: #ffffff66;
      border-radius: 0.125rem;
      margin: 1rem;

      .weather-degree-detail {
        position: absolute;
        height: 0.25rem;
        border-radius: 0.125rem;
        background: #ffffff;
        z-index: 1;
      }
    }
  }
  .weather-day {
    width: 3.125rem;
    text-align: right;
    margin-right: 0.75rem;
  }
  .weather-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.75rem;
  }
</style>
