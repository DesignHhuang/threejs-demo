import { h } from 'vue';
import { BasicColumn } from '@/components/Table';
import Icon from '@/components/Icon/Icon.vue';
import { Tag } from 'ant-design-vue';

export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: 'Device',
      dataIndex: 'deviceTypeName',
      key: 'deviceTypeName',
    },
    {
      title: 'Device name',
      dataIndex: 'deviceName',
      key: 'deviceName',
      customRender: ({ record }) => {
        return record.deviceName ? record.deviceName : '/';
      },
    },
    // {
    //   title: 'Model',
    //   dataIndex: 'outerModel',
    //   key: 'outerModel',
    // },
    {
      title: 'SN',
      dataIndex: 'subMasterSn',
      key: 'subMasterSn',
      customRender: ({ record }) => {
        return record.subMasterSn ? record.subMasterSn : '/';
      },
    },
    {
      title: 'Hardware',
      dataIndex: 'hardwareVersion',
      key: 'hardwareVersion',
      customRender: ({ record }) => {
        return record.hardwareVersion ? record.hardwareVersion : '/';
      },
      helpMessage: (
        <div>
          <div class="flex items-center pt-2 pb-2">
            <span style="color: #000">
              Only represents the current hardware version and cannot be upgraded by system
              software.
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'COM',
      width: 52,
      dataIndex: 'comStatus',
      key: 'comStatus',
      customRender: ({ record }) => {
        //后端逻辑：batComStatus为null的时候也是归为离线状态
        let attrs: any = { color: '#ff4d4f', icon: 'ph:wifi-x-bold' };
        switch (record.comStatus) {
          case 0:
            attrs = { color: '#ff4d4f', icon: 'ph:wifi-x-bold' };
            break;
          case 1:
            attrs = { color: '#52c41a', icon: 'ph:wifi-high-bold' };
            break;
          case 2:
            attrs = { color: '#faad14', icon: 'mdi:wifi-alert' };
            break;
        }
        return h(Icon, { size: 24, sizeType: 'px', ...attrs });
      },
    },
    {
      title: 'Running status',
      dataIndex: 'runningStatus',
      key: 'runningStatus',
      customRender: ({ record }) => {
        let attrs: any = null;
        // 热水器：0：待机（StandBy）1：使用太阳能加热（HeatingBySolar）2:使用电网加热（HeatingByGrid）3:使用太阳能和电网加热（HeatingBySolarAndGrid）4:EMS控制（EMSControl）5:异常（Faulty）
        // 电池：0：待机（StandBy）1:放电（Discharging）2:充电（Charging）3:休眠（Sleep）4:异常（Faulty）
        switch (record.runningStatus) {
          case 0:
            attrs = { color: '#52c41a', text: 'StandBy' };
            break;
          case 1:
            attrs = {
              color: '#FA8C16',
              text: record.productType === 0 ? 'Discharing' : 'HeatingBySolar',
            };
            break;
          case 2:
            attrs = {
              color: '#ff4d4f',
              text: record.productType === 0 ? 'Charing' : 'HeatingByGrid',
            };
            break;
          case 3:
            attrs = {
              color: '#ff4d4f',
              text: record.productType === 0 ? 'Sleep' : 'HeatingBySolarAndGrid',
            };
            break;
          case 4:
            attrs = { color: '#ff4d4f', text: record.productType === 0 ? 'Faulty' : 'EMSControl' };
            break;
          case 5:
            attrs = { color: '#ff4d4f', text: record.productType === 0 ? 'Faulty' : 'Faulty' };
            break;
        }
        return attrs ? h(Tag, { color: attrs.color }, () => attrs.text) : '/';
      },
    },
    {
      title: 'Firmware version',
      dataIndex: 'softwareVersion',
      key: 'softwareVersion',
    },
  ];
}
