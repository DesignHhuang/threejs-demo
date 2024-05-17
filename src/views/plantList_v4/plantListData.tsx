import { h } from 'vue';
import { BasicColumn } from '@/components/Table';
import Icon from '@/components/Icon/Icon.vue';
import { useFilterStoreWithOut } from '/@/store/modules/filters';
import { fromNowFormat } from '/@/utils/dateUtil';

const filterStore = useFilterStoreWithOut();

export function getBasicColumns(): BasicColumn[] {
  const filteredInfo = filterStore.getFilteredInfo;
  const filterItems = filterStore.getFilterItems;

  return [
    {
      title: 'Installation name',
      dataIndex: 'plantName',
      key: 'plantName',
      align: 'left',
    },
    {
      title: 'Com.',
      helpMessage: (
        <div>
          <div class="flex items-center pt-2 pb-2">
            <Icon class="ml-2 mr-3" size="1" icon="wifi|svg" />
            <span style="color: #000">Online: All devices are online</span>
          </div>
          <div style="background: #B6B7BA;height:1px"></div>
          <div class="flex items-center pt-2 pb-2">
            <Icon class="ml-2 mr-3" size="1" icon="comstatus_partially|svg" />
            <span style="color: #000">Partially offline: Some devices offline</span>
          </div>
          <div style="background: #B6B7BA;height:1px"></div>
          <div class="flex items-center pt-2 pb-2">
            <Icon class="ml-2 mr-3" size="1" icon="comstatus_offline|svg" />
            <span style="color: #000">Offline: None of the devices are online</span>
          </div>
          <div style="background: #B6B7BA;height:1px"></div>
          <div class="flex items-center pt-2 pb-2">
            <Icon class="ml-2 mr-3" size="1" icon="wifi_unbound|svg" />
            <span style="color: #000">Unbound device: No equipment</span>
          </div>
        </div>
      ),
      dataIndex: 'comStatus',
      key: 'comStatus',
      customRender: ({ record }) => {
        //后端逻辑：comStatus为null的时候也是归为离线状态
        let icon: string = 'comstatus_offline|svg';
        switch (record.comStatus) {
          case 0:
            icon = 'comstatus_offline|svg';
            break;
          case 1:
            icon = 'wifi|svg';
            break;
          case 2:
            icon = 'comstatus_partially|svg';
            break;
          case -1:
            icon = 'wifi_unbound|svg';
            break;
        }
        return h(Icon, { size: 1, icon });
      },
      // 0:离线 1:在线 2:部分在线
      filteredValue: filteredInfo.comStatus || null,
      filters:
        filterItems.comStatus.length > 0
          ? filterItems.comStatus.map((res) => {
              const icon =
                res === 0
                  ? 'comstatus_offline|svg'
                  : res === 1
                  ? 'wifi|svg'
                  : res === -1
                  ? 'wifi_unbound|svg'
                  : 'comstatus_partially|svg';
              const vnode = h(Icon, { size: 1, icon });
              return { text: vnode, value: res.toString() };
            })
          : undefined,
    },
    {
      title: 'Plant Type',
      dataIndex: 'plantType',
      key: 'plantType',
      // 1:仅热水器(Heating System) 2:仅电池(Battery System) 3:混合(Hybrid System)
      customRender: ({ record }) => {
        let attrs: any = { color: '#FF3B30', text: '--' };
        switch (record.plantType) {
          case 1:
            attrs = { color: '#34C759', text: 'Heating System' };
            break;
          case 2:
            attrs = { color: '#FFCC00', text: 'Battery System' };
            break;
          case 3:
            attrs = { color: '#FF3B30', text: 'Hybrid System' };
            break;
        }
        return h('div', attrs.text);
      },
      filteredValue: filteredInfo.plantType || null,
      filters:
        filterItems.plantType.length > 0
          ? filterItems.plantType.map((res) => {
              let text: any = null;
              switch (res) {
                case 1:
                  text = 'Heating System';
                  break;
                case 2:
                  text = 'Battery System';
                  break;  
                case 3:
                  text = 'Hybrid System';
                  break;
              }
              return {
                text,
                value: res.toString(),
              };
            })
          : undefined,
    },

    {
      title: 'Device',
      dataIndex: 'plantProductType',
      key: 'plantProductType',
      customRender: ({ record }) => {
        return record.plantProductType ?? '--';
      },
      filteredValue: filteredInfo.plantProductType || null,
      filters:
        filterItems.plantProductType.length > 0
          ? filterItems.plantProductType.map((res) => {
              const text = res.toString();
              return {
                text,
                value: text,
              };
            })
          : undefined,
    },
    {
      title: 'Power(kW)',
      key: 'batRealTimePower',
      dataIndex: 'batRealTimePower',
      /**
      "plantPower": {
                    "batChargePower": 0.0,
                    "batDischargePower": 0.0,
                    "wmPower": 0.0
                },
       */
      customRender: ({ record }) => {
        switch (record.plantType) {
          case 1:
            return record.plantPower.wmPower ?? '--';

          case 2:
            return record.plantPower.batChargePower !== null
              ? record.plantPower.batChargePower + ' ' + record.plantPower.batDischargePower
              : '--';
          default:
            return '--';
        }
      },

      // sorter: true,
    },

    {
      title: 'Running Status',
      dataIndex: 'runningStatus',
      key: 'runningStatus',

      helpMessage: (
        <div>
          <div class="flex items-center pt-2 pb-2">
            {/* <Icon class="ml-2 mr-3" size="24" icon="wifi|svg" /> */}
            <span style="color: #000">Normal：Installation of the collection is normal</span>
          </div>
          <div style="background: #B6B7BA;height:1px"></div>
          <div class="flex items-center pt-2 pb-2">
            {/* <Icon class="ml-2 mr-3" size="24" icon="comstatus_partially|svg" /> */}
            <span style="color: #000">
              Attention：Installation of the collection may offline, faults and other issues
            </span>
          </div>
        </div>
      ),
      customRender: ({ record }) => {
        let attrs: any = { color: '#FF3B30', text: 'Normal' };
        // 运行状态 0:NORMAL 1:Attention
        switch (record.runningStatus) {
          case 0:
            attrs = { color: '#34C759', text: 'Normal' };
            break;
          case 1:
            attrs = { color: '#FFCC00', text: 'Attention' };
        }
        return record.runningStatus !== null
          ? h(
              'div',
              {
                class: 'problemType',
                style: { background: attrs.color },
              },
              attrs.text,
            )
          : '--';
      },
      filteredValue: filteredInfo.runningStatus || null,
      filters:
        filterItems.runningStatus.length > 0
          ? filterItems.runningStatus.map((res) => {
              let text: any = null;
              switch (res) {
                case 0:
                  text = 'Normal';
                  break;
                case 1:
                  text = 'Attention';
                  break;
              }
              return {
                text,
                value: res.toString(),
              };
            })
          : undefined,
    },

    {
      title: 'Last update',
      dataIndex: 'lastUpdateTime',
      key: 'lastUpdateTime',
      customRender: ({ record }) => {
        //return record.lastUpdateTime ? formatToDateTime(record.lastUpdateTime) : '';
        return record.lastUpdateTime ? fromNowFormat(record.lastUpdateTime) : '';
      },
      sorter: true,
    },
  ];
}
