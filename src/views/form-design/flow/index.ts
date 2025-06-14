export type Options = {
  width: number;
  length: number;
  roadWidth: number;
  islandWidth: number;
  colors: {
    roadColor: any;
    islandColor: any;
    brokenLines: any;
    shoulderLines: any;
    /***  Only these colors can be an array ***/
    leftCars: any[];
    rightCars: any[];
    sticks: any;
  };
  lanesPerRoad: number;

  distortion: any;

  /*** These ones have to be arrays of [min,max].  ***/
  lightStickWidth: number[];
  lightStickHeight: number[];

  // Percentage of the lane's width
  shoulderLinesWidthPercentage: number;
  brokenLinesLengthPercentage: number;
  brokenLinesWidthPercentage: number;

  totalSideLightSticks: number;
  lightPairsPerRoadWay: number;

  /****  Anything below can be either a number or an array of [min,max] ****/
  // Length of the lights. Best to be less than total length
  carLightsLength: number | number[];
  // Radius of the tubes
  carLightsRadius: number | number[];
  // Width is percentage of a lane. Numbers from 0 to 1
  carWidthPercentage: number | number[];
  // How drunk the driver is.
  // carWidthPercentage's max + carShiftX's max -> Cannot go over 1.
  // Or cars start going into other lanes
  carShiftX: number | number[];
  // Self Explanatory
  carFloorSeparation: number | number[];
};

export const random = (base) => {
  if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
  return Math.random() * base;
};

export const pickRandom = (arr) => {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
  return arr;
};
