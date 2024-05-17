<template>
  <ClickOutSide @clickOutside="handleClickOutside">
    <a-select
      v-model:value="value"
      show-search
      allow-clear
      popupClassName="googlemap-select"
      placeholder="* Address"
      :filter-option="false"
      :dropdownMatchSelectWidth="260"
      :not-found-content="null"
      :options="data"
      @search="handleSearch"
      @change="handleChange"
      @dropdownVisibleChange="handleDropdownVisibleChange"
    >
      <template #suffixIcon>
        <img :src="location_v4" alt="location_v4" />
      </template>
    </a-select>

    <div class="google-map" v-show="showMap">
      <div
        ref="wrapGoogleRef"
        :style="{ height, width, borderRadius: '18px', position: 'relative' }"
      >
        <div ref="controlRef" class="gmapcontrol" v-if="!timeOut">
          <span class="gmapcontrol-btn" title="Click to recenter the map" @click="location">
            <Icon :size="18" size-type="px" icon="gis:location" />
          </span>
          <span class="gmapcontrol-btn" title="Switch full screen view" @click="fullScreen">
            <Icon
              :size="18"
              size-type="px"
              :icon="
                fullscreenState ? 'mingcute:fullscreen-exit-2-fill' : 'mingcute:fullscreen-2-fill'
              "
            />
          </span>
        </div>

        <div v-if="timeOut" class="googlemap-error">
          <span>Unable to connect to Google Maps service</span>
        </div>
      </div>
    </div>
  </ClickOutSide>
</template>
<script lang="ts" setup>
  import { ref, unref, onMounted, computed } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { Loader } from '@googlemaps/js-api-loader';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDebounceFn } from '@vueuse/core';
  import { Client } from '@googlemaps/google-maps-services-js';
  import { getAppEnvConfig } from '/@/utils/env';
  import location_v4 from '@/assets/svg/location_v4.svg';
  import { ClickOutSide } from '@/components/ClickOutSide';

  const { t } = useI18n();
  const { VITE_GLOB_GOOGLEMAP_KEY } = getAppEnvConfig();

  const client = new Client({});
  const loader = new Loader({
    apiKey: 'AIzaSyDG9CHsOLAC9PjyC6gR-B0LFCZlB7xr2w8',
    version: 'weekly',
  });

  defineProps({
    width: { type: String, default: '100%' },
    height: { type: String, default: '25rem' },
  });

  const emit = defineEmits(['changePoint', 'pointChanged']);

  const data = ref<any[]>([]);
  const value = ref();
  const showMap = ref(false);

  const wrapGoogleRef = ref<HTMLDivElement>();
  const controlRef = ref<HTMLDivElement>();
  const fullscreenState = ref(false);
  const timeOut = ref(false);

  const elementToSendFullscreen = computed(() => map?.getDiv().firstChild as HTMLElement);
  let markers: any[] = [];
  let map;
  const { createMessage } = useMessage();

  const initGoogleMap = async () => {
    try {
      const { Map } = await loader.importLibrary('maps');
      const { ControlPosition } = await loader.importLibrary('core');
      map = new Map(unref(wrapGoogleRef) as HTMLDivElement, {
        center: { lat: 31.508123, lng: 120.373487 },
        zoom: 16,
        mapTypeControl: false,
        disableDefaultUI: true,
        mapId: '77e6b04aa9d01d96',
      });
      map.controls[ControlPosition.RIGHT_BOTTOM].push(unref(controlRef));
      initLocation();
      map.addListener('click', function (e) {
        deleteMarkers();
        addMarker(e.latLng);
        latlng2text(e.latLng);
        emit('changePoint', { lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
    } catch (error) {
      timeOut.value = true;
      console.log(error);
    }
  };

  // 用户输入后获取可能的地址显示列表，并标记第一个点
  const handleSearch = useDebounceFn(async (val: string) => {
    try {
      if (!val) {
        deleteMarkers();
        emit('pointChanged', '');
        emit('changePoint', { lat: 31.508123, lng: 120.373487 });
        return;
      }
      const { PlacesService } = await loader.importLibrary('places');
      const service = new PlacesService(map);
      service.findPlaceFromQuery(
        {
          fields: [/* 'name', */ 'formatted_address', 'place_id', 'geometry.location'],
          query: val,
        },
        (results, status) => {
          if (status === 'OK' && results) {
            data.value = results.map((res) => ({
              label: res.formatted_address,
              value: res.place_id,
              location: res.geometry?.location,
            }));
            if (results.length > 0) {
              value.value = results[0].place_id;
              const pos = results[0].geometry?.location;
              deleteMarkers();
              addMarker(pos);
              map.panTo(pos);
              emit('pointChanged', results[0].formatted_address);
              emit('changePoint', {
                lat: results[0].geometry?.location?.lat(),
                lng: results[0].geometry?.location?.lng(),
              });
            }
          }
        },
      );
    } catch (error) {
      timeOut.value = true;
      createMessage.error('Can not use Google map service');
    }
  }, 500);

  const handleDropdownVisibleChange = (open) => {
    if (open) {
      showMap.value = true;
    }
  };
  const handleClickOutside = () => {
    showMap.value = false;
  };

  // 用户选中后设置地址及标记
  const handleChange = (val: string, option) => {
    console.log('handleChange');
    if (!val) {
      deleteMarkers();
      emit('pointChanged', '');
      emit('changePoint', { lat: 31.508123, lng: 120.373487 });
      return;
    }
    value.value = val;
    console.log(option);
    const pos = option.location;
    deleteMarkers();
    addMarker(pos);
    map.panTo(pos);
    emit('pointChanged', option.label);
    emit('changePoint', { lat: pos?.lat(), lng: pos?.lng() });
  };

  const addMarker = async (position) => {
    const { AdvancedMarkerElement } = await loader.importLibrary('marker');

    const marker = new AdvancedMarkerElement({
      position,
      map: map,
    });

    markers.push(marker);
  };

  function deleteMarkers(): void {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }

  // 确认选中地址
  const selectPosition = (position) => {
    deleteMarkers();
    addMarker(position);
    latlng2text(position);
    map.panTo(position);
    emit('changePoint', position);
  };

  const latlng2text = async (point) => {
    const { Geocoder } = await loader.importLibrary('geocoding');
    const geocoder = new Geocoder();
    geocoder.geocode({ location: point }, (result, status) => {
      console.log(result);
      if (status === 'OK' && result) {
        if (result.length > 0) {
          emit('pointChanged', result[0].formatted_address);
          value.value = result[0].formatted_address;
        }
      } else {
        createMessage.error(t('routes.home.parseError'));
      }
    });
  };

  const clearOverlays = () => {
    deleteMarkers();
    emit('pointChanged', '');
  };

  // 获取用户当前地址并显示及标记
  function initLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          selectPosition(pos);
        },
        () => {
          googleGeolocation(true);
        },
      );
    }
  }

  function location() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          selectPosition(pos);
        },
        () => {
          googleGeolocation();
        },
        { timeout: 3000 },
      );
    } else {
      console.log("Browser doesn't support Geolocation");
      googleGeolocation();
    }
  }

  const locationBylatlng = (lng: number, lat: number) => {
    const point = { lng: Number(lng), lat: Number(lat) };
    deleteMarkers();
    addMarker(point);
    map.panTo(point);
  };
  // 采用google的Geolocation API获取定位
  const googleGeolocation = async (init: boolean = false) => {
    const data = await client.geolocate({ data: {}, params: { key: VITE_GLOB_GOOGLEMAP_KEY } });
    if (data.status === 200) {
      const res = data.data as any;
      const pos = {
        lat: res.location.lat,
        lng: res.location.lng,
      };
      if (!init) {
        locationBylatlng(res.location.lng, res.location.lat);
        latlng2text(pos);
        emit('changePoint', pos);
      } else {
        map.panTo(pos);
      }
    } else {
      createMessage.error('HTML5 Geolocation & Google Geolocate failed!');
    }
  };

  const fullScreen = () => {
    if (isFullscreen(elementToSendFullscreen.value)) {
      exitFullscreen();
    } else {
      requestFullscreen(elementToSendFullscreen.value);
    }
  };

  document.onwebkitfullscreenchange =
    document.onmsfullscreenchange =
    document.onmozfullscreenchange =
    document.onfullscreenchange =
      () => {
        if (isFullscreen(elementToSendFullscreen.value)) {
          fullscreenState.value = true;
        } else {
          fullscreenState.value = false;
        }
      };

  function isFullscreen(element: HTMLElement) {
    return (
      (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement) == element
    );
  }

  function requestFullscreen(element: HTMLElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullScreen) {
      element.msRequestFullScreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  onMounted(() => {
    initGoogleMap();
  });

  defineExpose({ locationBylatlng, clearOverlays });
</script>
<style lang="less">
  .googlemap-select {
    min-width: 260px !important;
  }
  .google-map {
    position: absolute;
    width: 100%;
    margin-top: 2px;
    z-index: 1;
  }
  .gmapcontrol {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    margin-right: 12px;
  }

  .gmapcontrol-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 0px solid rgba(168, 168, 168, 0.5);
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(7.5px);
    color: #f8f8f8cc;
    cursor: pointer;

    &:last-child {
      margin-left: 8px;
    }
  }

  .googlemap-error {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff3b30;
    border-radius: 20px;
    border: 1px solid rgb(225 225 225);
    background: rgb(246 246 246 / 87%);
    backdrop-filter: blur(40px);
  }
</style>
