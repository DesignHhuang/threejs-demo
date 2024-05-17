<template>
  <div class="weather">
    <div class="flex items-center justify-between h-40">
      <div class="font-w-12-600 ml-5">{{ plantInfo?.address }} ({{ plantInfo?.regionName }})</div>

      <div class="weather-refresh icon-btn-margin">
        <div class="update-time">
          {{
            weatherInfo?.weatherCurrent?.lastUpdateTime
              ? `Updated ${fromNowFormat(weatherInfo?.weatherCurrent?.lastUpdateTime)}`
              : ''
          }}
        </div>
        <div class="icon-btn" @click="run(plantId)">
          <img class="icon-btn-img" :src="weather_refresh_v4" alt="weather_refresh_v4" />
        </div>
      </div>
    </div>
    <div class="weather-con">
      <div>
        <div class="font-w-40-600">
          <div v-if="weatherInfo">{{ weatherInfo?.weatherCurrent?.temperature }}º</div>
          <div v-else>--</div>
        </div>
        <div class="weatherDesc">{{ weatherInfo?.weatherCurrent?.weatherDesc ?? 'No Data' }}</div>
        <div class="flex items-center font-w-12-600">
          <Icon icon="sun_fog_v4|svg" :size="1.625" />
          <span class="ml-1">{{ weatherInfo?.weatherCurrent?.sunriseTime }} AM</span>
          <span class="ml-1">-</span>
          <span class="ml-1">{{ weatherInfo?.weatherCurrent?.sunsetTime }} PM</span>
        </div>
        <div class="flex items-center font-w-12-600">
          <Icon icon="icon_wind_v4|svg" :size="1.625" />
          <span class="ml-1">
            WIND {{ weatherInfo?.weatherCurrent?.windDirection }}º
            {{ weatherInfo?.weatherCurrent?.windSpeed }}m/s
          </span>
        </div>
        <div class="flex items-center font-w-12-600">
          <Icon icon="uv_v4|svg" :size="1.625" />
          <span class="ml-1">
            UV Index
            {{ weatherInfo?.weatherCurrent?.ultravioletLevel }}
            {{ weatherInfo?.weatherCurrent?.ultravioletDesc }}
          </span>
        </div>
      </div>
      <div class="detail">
        <div
          v-for="(weather, index) in weatherInfo?.weatherDailyList"
          :key="weather.date"
          :class="[
            weatherDetailStyle(index),
            weather.week === 'YDY' ? 'font-w-12-600-6' : 'font-w-12-600',
          ]"
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
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Icon from '@/components/Icon/Icon.vue';
  import { computed, ref } from 'vue';
  import { useRequest } from 'vue-request';
  import { getWeather } from '/@/api/wattspace/powerStation';
  import { WeatherDailyVo, WeatherDataVo } from '/@/api/wattspace/model/powerStationModel';
  import { fromNowFormat } from '/@/utils/dateUtil';
  import weather_refresh_v4 from '@/assets/svg/weather_refresh_v4.svg';
  import { max, min } from 'lodash-es';

  const props = defineProps({
    plantId: { type: String, default: '' },
    plantInfo: { type: Object, default: () => {} },
  });
  // 获取weather
  const weatherInfo = ref<WeatherDataVo>();
  const perTemp = ref(1);
  const weatherDailymin = ref(0);

  const { run } = useRequest(getWeather, {
    manual: false,
    defaultParams: [props.plantId],
    onSuccess(data) {
      weatherInfo.value = data;
      const weatherDailyList = data.weatherDailyList;
      weatherDailymin.value = min(weatherDailyList.map((res) => res.minTemperature)) as number;
      const weatherDailymax = max(weatherDailyList.map((res) => res.maxTemperature));
      perTemp.value = 100 / (Number(weatherDailymax) - Number(weatherDailymin.value));
    },
  });

  const todayIcon = computed(() => weatherInfo.value?.weatherCurrent?.weatherCode + '_H|svg');

  const compute = (minTemperature, maxTemperature) => {
    const left = (minTemperature - weatherDailymin.value) * perTemp.value;
    const right = (maxTemperature - weatherDailymin.value) * perTemp.value;
    return { left: `${left}%`, width: `${right - left}%` };
  };

  const weatherIcon = (weather: WeatherDailyVo) => {
    return weather.weatherCode + '|svg';
  };

  const weatherDetailStyle = (index) => (index == 0 ? 'weather-detail-special' : 'weather-detail');
</script>

<style lang="less" scoped>
  .weather {
    height: 15.125rem;
    border-radius: 20px;
    background: linear-gradient(180deg, rgba(0, 96, 184, 0.72) 0%, rgba(107, 160, 209, 0.72) 100%);
    .weather-refresh {
      display: flex;
      align-items: center;
    }
    .update-time {
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      margin-right: 0.375rem;
    }

    .weather-con {
      display: flex;
      justify-content: space-between;
      padding: 10px 20px 20px 20px;
      align-items: end;

      .weather-item {
        height: 2rem;
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
    .weatherDesc {
      margin-top: 0.125rem;
      color: #fff;
      text-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
      font-size: 1rem;
      margin-bottom: 1.5rem;
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
  }
</style>
