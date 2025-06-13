export type Options = {
  width: number;
  length: number;
  roadWidth: number;
  islandWidth: number;
  colors: {
    roadColor: string;
    islandColor: string;
    brokenLines: string;
    shoulderLines: string;
  };
  lanesPerRoad: number;

  distortion: any;

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
