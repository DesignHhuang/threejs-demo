<template>
  <div class="warpper w-full h-full flex justify-center items-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="222"
      height="39"
      viewBox="0 0 222 39"
    >
      <defs>
        <path id="loop-normal" d="M3.67773 38.5709V3.125H221.778" />

        <!-- radial gradient has same color at constnnt distance from center,
         regardless of direction-->
        <radialGradient
          id="fade"
          cx="0"
          cy="0"
          fx="0"
          fy="0"
          r="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#01f061" stop-opacity="1" offset="0" />
          <!-- change offset to make faiding "tail" longer or shorter -->
          <stop stop-color="#01f061" stop-opacity="1" offset="0.6" />
          <stop stop-color="#01f061" stop-opacity="0" offset="1" />
        </radialGradient>

        <!-- mask shows only stroked area of path. Stroke length must be longer
         than gradient radius, as path can be curved-->
        <mask id="tail" maskUnits="userSpaceOnUse">
          <use
            style="fill: none; stroke: #ff8a00; stroke-width: 6; stroke-dasharray: 250 1664"
            xlink:href="#loop-normal"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="250"
              to="-1664"
              dur="3s"
              repeatCount="indefinite"
            />
          </use>
        </mask>
      </defs>
      <use style="fill: none; stroke: #ccc; stroke-width: 6" xlink:href="#loop-normal" />

      <!-- outer group makes sure mask is applied after animateMotion -->
      <g style="mask: url(#tail)">
        <!-- circle with gradient radius -->
        <circle style="fill: url(#fade)" cx="0" cy="0" r="100">
          <animateMotion keyPoints="0;1" keyTimes="0;1" dur="3s" repeatCount="indefinite">
            <mpath xlink:href="#loop-normal" />
          </animateMotion>
        </circle>
      </g>
    </svg>
  </div>
</template>
<script lang="ts" setup></script>

<style lang="less" scoped>
  .warpper {
    position: relative;
  }
</style>
