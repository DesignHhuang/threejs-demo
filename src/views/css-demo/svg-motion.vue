<template>
  <div class="warpper">
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
