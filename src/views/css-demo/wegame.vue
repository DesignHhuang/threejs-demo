<template>
  <div class="warpper">
    <div class="g-scroll" id="g-scroll"></div>
    <div class="g-wrap">
      <!-- <div class="g-bg"></div>
      <div class="g-container">
        <div class="g-wegame"></div>
        <div class="g-mask"></div>
        <div class="g-logo"></div>
      </div> -->
    </div>
  </div>
</template>
<script lang="ts" setup></script>

<style lang="less" scoped>
  .warpper {
    position: relative;
  }
  .g-scroll {
    position: relative;
    height: 500vh;
  }

  .g-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .g-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    animation-name: scale;
    animation-duration: 10s;
    animation-timeline: box-move;
  }

  .g-bg {
    position: fixed;
    width: 100vw;
    height: 100vh;
    // background: repeating-linear-gradient(45deg, #000, #000 10px, #fff 10px, #fff 20px);
    background: url(@/assets/images/sc02.png);
    background-size: 80%;
    background-position: center;
    background-repeat: no-repeat;
  }

  .g-wegame {
    position: absolute;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(-75deg, #715633, #2b2522);
    mask: url(@/assets/svg/we.svg), linear-gradient(#fff, #fff);
    mask-repeat: no-repeat;
    mask-position: center center;
    -webkit-mask-composite: xor;
  }

  .g-mask {
    position: aboslute;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(-75deg, #715633, #2b2522);
    z-index: 2;
    animation-name: reOpacityChange;
    animation-duration: 10s;
    animation-timeline: box-move;
    animation-function-timing: linear;
  }

  .g-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(calc(-50% - 2px), calc(-50% - 2px));
    width: 448px;
    height: 532px;
    background: url(@/assets/svg/we.svg);
    background-repeat: no-repeat;
    background-position: center center;
    z-index: 3;
    animation-name: reOpacityChange;
    animation-duration: 10s;
    animation-timeline: box-move;
  }

  /* @scroll-timeline box-move {
    source: selector('#g-scroll');
    orientation: 'vertical';
  } */
  @keyframes reOpacityChange {
    0%,
    50% {
      opacity: 1;
    }
    90% {
      opacity: 0.2;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes scale {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(5);
    }
    70% {
      transform: scale(20);
    }
    100% {
      transform: scale(60);
    }
  }
</style>
