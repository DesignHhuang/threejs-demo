<template>
  <div class="home-page-top-tool">
    <HomeSearch :keyword="keyword" @getPlantList="addPlant2Earth" @clearFilter="clearFilter" />

    <div v-if="hasAuthority('Add plant')" class="home-add-plant" @click="addPlant">
      <div class="text-left"> Add </div>
      <div class="text-icon">
        <img class="text-icon-img" :src="add_v4" :alt="add_v4" />
      </div>
    </div>
  </div>
  <div id="map"></div>
  <div class="home-page-bottom-tool">
    <div v-if="showMinScale" class="icon-btn w-h-40" @click="zoomMin">
      <img class="w-h-20" :src="scale_earth_v4" alt="scale_earth_v4" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref, unref } from 'vue';
  import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
  import { useWindowSizeFn } from '@desk-v4/hooks';
  import { useRequest } from 'vue-request';
  import { getEarthPlantList, getPlantInfoById } from '/@/api/wattspace/powerStation';
  import { useMapboxGlobe } from './useMapboxGlobe';
  import HomeSearch from '../search/index.vue';
  import offline_v4 from '@/assets/svg/offline_v4.svg';
  import online_v4 from '@/assets/svg/online_v4.svg';
  import comstatus_partially_v4 from '@/assets/svg/comstatus_partially_v4.svg';
  import device_unbound_v4 from '@/assets/svg/device_unbound_v4.svg';
  import plant_status_ok_v4 from '@/assets/svg/plant_status_ok_v4.svg';
  import plant_status_error_v4 from '@/assets/svg/plant_status_error_v4.svg';
  import divider_v4 from '@/assets/svg/divider_v4.svg';
  import { on } from '/@/utils/domUtils';
  import { useGo } from '/@/hooks/web/usePage';
  import scale_earth_v4 from '@/assets/svg/scale_earth_v4.svg';
  import { usePermission } from '@/hooks/web/usePermission';
  import add_v4 from '@/assets/svg/add_v4.svg';
  import echarts from '@/utils/lib/echarts';

  const emit = defineEmits(['addPlant']);

  const go = useGo();
  const { hasAuthority } = usePermission();

  const keyword = ref();
  const map = ref();
  const showMinScale = ref(false);
  mapboxgl.accessToken =
    'pk.eyJ1Ijoid2F0dHNvbmljbWFwYm94IiwiYSI6ImNsdmRxZXdhYjAxeGIya280dWRlNWxiNWoifQ.-i2XN9giOhBZDJFRaZsLHw';

  const { run, data: plants } = useRequest(getEarthPlantList, {
    onSuccess: (data) => {
      const features = data.map((res) => ({
        type: 'Feature',
        properties: res,
        geometry: {
          type: 'Point',
          coordinates: [res.longitude, res.latitude],
        },
      }));
      unref(map).on('load', () => {
        unref(map).addSource('plants', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features,
          },
        });
        unref(map).addLayer({
          id: 'plantLayer',
          source: 'plants',
          type: 'symbol',
          layout: {
            'icon-image': [
              'case',
              ['==', ['get', 'runningStatus'], 0],
              'plantOk-dot',
              'plantAttention-dot',
            ],
            /* 'text-anchor': 'left',
            'text-field': ['get', 'plantName'], */
          },
          /* type: 'circle',
          paint: {
            'circle-color': ['case', ['==', ['get', 'runningStatus'], 0], '#0078D4', '#FF2D55'],
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          }, */
        });
      });
      setPopup();
    },
  });

  const popup = new mapboxgl.Popup({
    anchor: 'left',
    closeButton: false,
    closeOnClick: true,
    maxWidth: '36rem',
  });

  const showPopup = (coordinates, plantInfo) => {
    const runningStatus =
      plantInfo.runningStatus === 0
        ? { name: 'Normal', icon: plant_status_ok_v4 }
        : {
            name: 'Attention',
            icon: plant_status_error_v4,
          };
    let comStatus = { name: 'Offline', icon: offline_v4 };
    switch (plantInfo.comStatus) {
      case 0:
        comStatus = { name: 'Offline', icon: offline_v4 };
        break;
      case 1:
        comStatus = { name: 'Online', icon: online_v4 };
        break;
      case 2:
        comStatus = { name: 'Partially offline', icon: comstatus_partially_v4 };
        break;
      case -1:
        comStatus = { name: 'Unbound device', icon: device_unbound_v4 };
        break;
    }
    const html = `<div class="plant-item" style="background:${
      runningStatus.name === 'Normal' ? '#0078D4' : '#FF2D55'
    }">
      <div class="flex items-center">
        <div class="company-logo">${String(plantInfo.plantName)[0].toUpperCase()}</div>
        <div class="company-info">
          <div class="font-w-18-600">${plantInfo.plantName}</div>
          <div class="flex items-center">
            <img class="crad-plant-info-icon mr-1" src="${comStatus.icon}" alt="comstatus_v4" />
            <div class="font-w-10-600 mr-1">${comStatus.name}</div>
            <img class="crad-plant-divider m-1" src="${divider_v4}" alt="divider_v4" />
            <img
              class="crad-plant-info-icon mr-1"
              src="${runningStatus.icon}"
              alt="plant_status_ok_v4"
            />
            <div class="font-w-10-600 mr-1">${runningStatus.name}</div>
            <img class="crad-plant-divider m-1" src="${divider_v4}" alt="divider_v4" />
            <div class="font-w-10-600">${plantInfo.plantTypeName || 'Battery System'}</div>
          </div>
        </div>
      </div>
      <div class="flex items-center ml-2">
        <div class="echarts-data" id="feature-${plantInfo.plantId}"></div>
      </div>
    </div>`;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    /* while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      } */

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(html).addTo(unref(map));

    on(popup.getElement(), 'click', () => go(`/plantList/${plantInfo.plantId}/overView`));

    // 渲染电站卡片中的echarts 图
    const chartEl = document.getElementById(`feature-${plantInfo.plantId}`);
    getPlantInfoById({ plantIds: [plantInfo.plantId] }).then((res) => {
      if (res[0].realTimePowers) {
        const realTimePowers = res[0].realTimePowers[0].trend;
        const echartData = realTimePowers.map((res, index) => ({ id: index, value: res }));
        const xData = echartData.map((res) => res.id);
        const yData = echartData.map((res) => {
          if (res.id + 1 === echartData.length) {
            return {
              label: {
                show: true,
                color: '#ffffff',
                opacity: 0.8,
                distance: 0,
                offset: [-10, 0],
                formatter: '{c}kW',
                fontWeight: 600,
                fontSize: 10,
                fontFamily: 'Albert Sans',
              },
              value: res.value,
              symbolSize: 12,
              symbolKeepAspect: true,
              symbol: 'image://https://www.wattdesk.com/dot-white.svg',
            };
          } else {
            return { value: res.value, symbol: 'none' };
          }
        });

        if (chartEl) {
          var myChart = echarts.init(chartEl);
          var option;
          option = {
            grid: {
              show: true,
              borderWidth: 0,
              top: 14,
              left: 2,
              right: 6,
              bottom: 14,
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: xData,
              axisLine: {
                lineStyle: {
                  color: '#FFFFFF',
                  type: [2, 3],
                },
              },
              axisTick: {
                show: false,
              },
              axisLabel: {
                show: false,
              },
            },
            yAxis: {
              type: 'value',
              show: false,
            },
            series: [
              {
                data: yData,
                type: 'line',
                smooth: true,
                lineStyle: {
                  color: '#FFFFFF',
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(255, 255, 255, 0.8)',
                      },
                      {
                        offset: 1,
                        color: 'rgba(255, 255, 255, 0)',
                      },
                    ],
                  },
                },
              },
            ],
          };
          option && myChart.setOption(option);
        }
      }
    });
  };

  const setPopup = () => {
    unref(map).on('mouseenter', 'plantLayer', (e) => {
      // Change the cursor style as a UI indicator.
      unref(map).getCanvas().style.cursor = 'pointer';
      const feature = e.features[0];
      const coordinates = feature.geometry.coordinates.slice();
      const plantInfo = feature.properties;
      showPopup(coordinates, plantInfo);
    });

    /* unref(map).on('mouseleave', ['layer-with-places_ok', 'layer-with-places_attention'], () => {
        unref(map).getCanvas().style.cursor = '';
        popup.remove();
      }); */
  };

  const initMapbox = () => {
    map.value = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/wattsonicmapbox/clutmasiy002c01qx4e1kaw8t',
      projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
      zoom: 2,
      center: [30, 15],
    });

    const { plantOkDot, plantErrorDot } = useMapboxGlobe(map.value);

    //unref(map).addControl(new mapboxgl.NavigationControl());

    // At low zooms, complete a revolution every two minutes.
    const secondsPerRevolution = 240;
    // Above zoom level 5, do not rotate.
    const maxSpinZoom = 5;
    // Rotate at intermediate speeds between zoom levels 3 and 5.
    const slowSpinZoom = 3;

    let userInteracting = false;
    const spinEnabled = true;

    function spinGlobe() {
      const zoom = unref(map).getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          // Slow spinning at higher zooms
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = unref(map).getCenter();
        center.lng -= distancePerSecond;
        // Smoothly animate the map over one second.
        // When this animation is complete, it calls a 'moveend' event.
        unref(map).easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    unref(map).addImage('plantOk-dot', plantOkDot, { pixelRatio: 2 });
    unref(map).addImage('plantAttention-dot', plantErrorDot, { pixelRatio: 2 });

    /* unref(map).addSource('dot-point', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [120.373487, 31.508123], // icon position [lng, lat]
                },
              },
            ],
          },
        }); */
    /* unref(map).addLayer({
          id: 'layer-with-pulsing-dot',
          type: 'symbol',
          source: 'dot-point',
          layout: {
            'icon-image': 'plantOk-dot',
          },
        }); */

    /* map.on('zoom', () => {
        if (map.getZoom() > zoomThreshold) {
          stateLegendEl.style.display = 'none';
          countyLegendEl.style.display = 'block';
        } else {
          stateLegendEl.style.display = 'block';
          countyLegendEl.style.display = 'none';
        }
      }); */

    // Pause spinning on interaction
    unref(map).on('mousedown', () => {
      userInteracting = true;
    });
    unref(map).on('dragstart', () => {
      userInteracting = true;
    });

    unref(map).on('zoomend', () => {
      if (unref(map).getZoom() > 4) {
        showMinScale.value = true;
        // 直接显示popup的内容
        /* const features = unref(map).queryRenderedFeatures({ layers: ['plantLayer'] });
        if (features) {
          const uniqueFeatures = getUniqueFeatures(features, 'plantId');
          uniqueFeatures.map((res) => {
            const popup = new mapboxgl.Popup({
              anchor: 'left',
              closeButton: false,
              closeOnClick: true,
              maxWidth: '36rem',
            });
            const coordinates = res.geometry.coordinates.slice();
            const plantInfo = res.properties;
            const html = `<div class="plant-item-middle-card">
          <div class="font-b-10-600">${plantInfo.plantName}</div>
    </div>`;
            popup.setLngLat(coordinates).setHTML(html).addTo(unref(map));
            on(popup.getElement(), 'click', () => go(`/plantList/${plantInfo.plantId}/overView`));
          });
          middleShowed.value = true;
        } */
      } else {
        showMinScale.value = false;
      }
    });

    // When animation is complete, start spinning if there is no ongoing interaction
    unref(map).on('moveend', () => {
      spinGlobe();
    });

    spinGlobe();
  };

  const centerEarth = () => {
    map.value.easeTo({
      padding: { left: document.getElementById('homePageLeft')?.offsetWidth },
      duration: 1000,
    });
  };

  // 将电站添加到地球中
  const addPlant2Earth = async (options) => {
    keyword.value = options.keyword;
    const dataSource = await getEarthPlantList(options);
    if (dataSource.length > 0) {
      fiterFeatures(dataSource);
    }
  };

  function getUniqueFeatures(features, comparatorProperty) {
    const uniqueIds = new Set();
    const uniqueFeatures: any[] = [];
    for (const feature of features) {
      const id = feature.properties[comparatorProperty];
      if (!uniqueIds.has(id)) {
        uniqueIds.add(id);
        uniqueFeatures.push(feature);
      }
    }
    return uniqueFeatures;
  }

  const fiterFeatures = (dataSource) => {
    const filtered = dataSource.map((res) => res.plantId);
    unref(map).setFilter('plantLayer', ['match', ['get', 'plantId'], filtered, true, false]);
    const flyToFeature = dataSource[0];
    unref(map).flyTo({
      center: [flyToFeature.longitude, flyToFeature.latitude],
      zoom: 9,
      speed: 1,
      curve: 1,
      easing(t) {
        return t;
      },
    });
    showPopup([flyToFeature.longitude, flyToFeature.latitude], dataSource[0]);
  };

  const clearFilter = () => {
    keyword.value = null;
    unref(map).setFilter('plantLayer', null);
    unref(map).zoomTo(2, { duration: 2000, offset: [100, 50] });
  };

  const location = (plantId: string) => {
    const location_plant = plants.value.find((res) => res.plantId === plantId);
    keyword.value = location_plant.plantName;
    if (location_plant) {
      fiterFeatures([location_plant]);
    }
  };

  const zoomMin = () => {
    unref(map).zoomTo(2, { duration: 2000 });
  };

  const addPlant = () => {
    emit('addPlant');
  };

  onMounted(() => {
    initMapbox();
    centerEarth();
    run({});
  });

  useWindowSizeFn(centerEarth);

  defineExpose({ location });
</script>
<style lang="less">
  @import url('./index.less');
</style>
