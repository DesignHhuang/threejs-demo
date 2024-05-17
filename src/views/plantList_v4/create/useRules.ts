import type { RuleObject } from 'ant-design-vue/lib/form/interface';
import { getPlantExist } from '/@/api/wattspace/powerStation';

const validatePlantName = () => {
  return async (_: RuleObject, value: string) => {
    if (!value) {
      return Promise.reject('Please enter plant name');
    }
    // 调用判断电站名称是否存在的接口
    const isExist = await getPlantExist({ plantName: value });
    if (isExist) {
      return Promise.reject('This plant name has already been added');
    }
    return Promise.resolve();
  };
};

export const step1FormRules = {
  plantName: [{ validator: validatePlantName(), trigger: 'blur' }],
  region: [{ required: true }],
  timezone: [{ required: true }],
  address: [{ required: true }],
  longitude: [{ required: true }],
  latitude: [{ required: true }],
  installer: [{ required: true }],
};
