<template>
  <div class="warpper">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="300px"
      height="200px"
      viewBox="0 0 685 310"
    >
      <defs>
        <path
          id="loop-normal"
          d="M10 80 Q 77.5 10, 145 80 T 280 80"
        />

        <!-- radial gradient has same color at constnnt distance from center,
         regardless of direction-->
        <radialGradient
          id="fade"
          cx="0"
          cy="0"
          fx="0"
          fy="0"
          r="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#000" stop-opacity="1" offset="0" />
          <!-- change offset to make faiding "tail" longer or shorter -->
          <stop stop-color="#000" stop-opacity="1" offset="0.6" />
          <stop stop-color="#000" stop-opacity="0" offset="1" />
        </radialGradient>

        <!-- mask shows only stroked area of path. Stroke length must be longer
         than gradient radius, as path can be curved-->
        <mask id="tail" maskUnits="userSpaceOnUse">
          <use
            style="fill: none; stroke: #FF8A00; stroke-width: 6; stroke-dasharray: 250 1664"
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
        <circle style="fill: url(#fade)" cx="0" cy="0" r="200">
          <animateMotion keyPoints="0;1" keyTimes="0;1" dur="3s" repeatCount="indefinite">
            <mpath xlink:href="#loop-normal" />
          </animateMotion>
        </circle>
      </g>

      <!-- leading dot circle -->
      <circle style="fill: #000" cx="0" cy="0" r="7">
        <animateMotion keyPoints="0;1" keyTimes="0;1" dur="3s" repeatCount="indefinite">
          <mpath xlink:href="#loop-normal" />
        </animateMotion>
      </circle>
    </svg>
    

    <div class="svg-motion-0">
      <svg width="56px" height="6px" viewBox="-2 -2 56 6" fill="none">
        <path
          d="M1.43433 1.28612L51.0056 1.28612"
          stroke="#ebf2f9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shadow"
        />
        <path
          fill="transparent"
          stroke="#FF8A00"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M1.43433 1.28612L51.0056 1.28612"
          class="line1"
        ></path>
      </svg>
    </div>

    <div class="svg-motion-1">
      <svg width="300px" height="175px" version="1.1">
        <path
          fill="transparent"
          stroke="#000000"
          stroke-width="4"
          d="M10 80 Q 77.5 10, 145 80 T 280 80"
          class="path"
        ></path>
      </svg>
    </div>
    <div class="svg-motion-2">
      <svg width="100px" height="30px" viewBox="-6 -6 101 31" fill="none">
        <path
          d="M1 21.2966V16.2757C1 7.99141 7.71573 1.27568 16 1.27568H91.4531"
          stroke="#ebf2f9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shadow"
        />
        <path
          fill="transparent"
          stroke="#00A2FE"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M1 21.2966V16.2757C1 7.99141 7.71573 1.27568 16 1.27568H91.4531"
          class="line1"
        ></path>
      </svg>

      <!-- <svg width="93" height="23" version="1.1">
        <path
          fill="transparent"
          stroke="#00A2FE"
          stroke-width="4"
          d="M10 80 Q 77.5 10, 145 80 T 280 80"
          class="line1"
        ></path>
        <path
          fill="transparent"
          stroke="#000000"
          stroke-width="4"
          d="M1 21.2966V16.2757C1 7.99141 7.71573 1.27568 16 1.27568H91.4531"
        ></path>
      </svg> -->
    </div>
    <div class="svg-motion-3">
      <svg width="300px" height="175px" version="1.1">
        <path
          fill="transparent"
          stroke="#888888"
          stroke-width="1"
          d="M10 80 Q 77.5 10, 145 80 T 280 80"
          class="path"
        ></path>
      </svg>

      <div class="ball"></div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>

<style lang="less" scoped>
  .svg-motion-0 {
    background: #fff;
    height: 300px;
    width: 100%;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      width: 600px;
      height: 200px;
      display: block;
      position: absolute;
    }
    svg .line1 {
      stroke-dasharray: 55, 104;
      stroke-dashoffset: 50;
      animation: dash 2s linear infinite;
      filter: drop-shadow(0 0 2px #17a6f7) drop-shadow(0 0 2px #2aacf5);
    }
    @keyframes dash {
      from {
        stroke-dashoffset: 159;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  }

  .shadow {
    -webkit-filter: drop-shadow(0px 0px 2px #ebf2f97a);
    filter: drop-shadow(0px 0px 2px #ebf2f97a);
  }
  .svg-motion-1 {
    background: #fff;
    height: 300px;
    width: 100%;
    margin-top: 20px;
    svg {
      width: 300px;
      display: block;
      position: absolute;

      .path {
        stroke-dasharray: 320;
        stroke-dashoffset: 20;
        //animation: dash 1s linear;
      }

      @keyframes dash {
        from {
          stroke-dashoffset: 320;
        }
        to {
          stroke-dashoffset: 0;
        }
      }
    }
  }
  .svg-motion-2 {
    background: #fff;
    height: 300px;
    width: 100%;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* svg {
      width: 300px;
      height: 200px;
      padding: 10px;
      display: block;
      position: absolute;
    } */
    svg .line1 {
      stroke-dasharray: 55, 104;
      stroke-dashoffset: 50;
      animation: dash 2s linear infinite;
      filter: drop-shadow(0 0 2px #17a6f7) drop-shadow(0 0 2px #2aacf5);
    }
    @keyframes dash {
      from {
        stroke-dashoffset: 159;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  }
  .svg-motion-3 {
    background: #fff;
    height: 300px;
    width: 100%;
    margin-top: 20px;
    svg {
      width: 300px;

      display: block;
      position: absolute;
    }

    .ball {
      width: 10px;
      height: 10px;
      background-color: red;
      border-radius: 50%;

      offset-path: path('M10 80 Q 77.5 10, 145 80 T 280 80');
      offset-distance: 0%;

      animation: red-ball 2s linear infinite;
    }

    @keyframes red-ball {
      from {
        offset-distance: 0%;
      }
      to {
        offset-distance: 100%;
      }
    }
  }
</style>
