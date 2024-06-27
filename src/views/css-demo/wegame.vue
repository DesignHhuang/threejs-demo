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
    <!-- down-flow -->
    <svg width="222" height="39" viewBox="0 0 222 39" fill="none">
      <path
        d="M3.67773 38.5709V3.125H221.778"
        stroke="#ebf2f9"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="up-shadow"
      />
      <path
        fill="transparent"
        stroke="#15eb26"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.67773 38.5709V3.125H221.778"
        class="up-line1"
      ></path>
    </svg>
    <!-- input-flow -->
    <svg width="116" height="7" viewBox="0 0 116 7" fill="none">
      <path
        d="M0.921875 3.85156L115.499 3.85157"
        stroke="#ebf2f9"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="up-shadow"
      />
      <path
        fill="transparent"
        stroke="#15eb26"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M0.921875 3.85156L115.499 3.85157"
        class="up-line1"
      ></path>
    </svg>
    <!-- output-flow -->
    <svg width="140" height="65" viewBox="0 0 140 65" fill="none">
      <path
        d="M0.265625 3.125H31.3375C41.2786 3.125 49.3375 11.1839 49.3375 21.125V43.8398C49.3375 53.781 57.3963 61.8398 67.3375 61.8398H139.378"
        stroke="#ebf2f9"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="up-shadow"
      />
      <path
        fill="transparent"
        stroke="#15eb26"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M0.265625 3.125H31.3375C41.2786 3.125 49.3375 11.1839 49.3375 21.125V43.8398C49.3375 53.781 57.3963 61.8398 67.3375 61.8398H139.378"
        class="up-line1"
      ></path>
    </svg>
    <!-- up-flow -->
    <svg width="222" height="39" viewBox="0 0 222 39" fill="none">
      <path
        d="M3.67773 0.405681V35.8516H221.778"
        stroke="#ebf2f9"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="up-shadow"
      />
      <path
        fill="transparent"
        stroke="#15eb26"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.67773 0.405681V35.8516H221.778"
        class="up-line1"
      ></path>
    </svg>
  </div>
</template>
<script lang="ts" setup></script>

<style lang="less" scoped>
  .warpper {
    position: relative;
  }

  .up-shadow {
    -webkit-filter: drop-shadow(0px 0px 2px #ebf2f97a);
    filter: drop-shadow(0px 0px 2px #ebf2f97a);
  }
  svg .up-line1 {
    stroke-dasharray: 100, 104;
    animation: dash 2s linear infinite;
    //filter: drop-shadow(0 0 2px #17a6f7) drop-shadow(0 0 2px #2aacf5);
  }
  @keyframes dash {
    from {
      stroke-dashoffset: 204;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
