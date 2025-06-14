import * as THREE from 'three';
import { lerp, resizeRendererToDisplaySize, type Options } from '.';
import { Road } from './road';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect } from 'postprocessing';
import { CarLights } from './carLinghts';
import { LightsSticks } from './lightsSticks';

const distortion_uniforms = {
  uDistortionX: new THREE.Uniform(new THREE.Vector2(80, 3)),
  uDistortionY: new THREE.Uniform(new THREE.Vector2(-40, 2.5)),
};

const distortion_vertex = `
#define PI 3.14159265358979
  uniform vec2 uDistortionX;
  uniform vec2 uDistortionY;

    float nsin(float val){
    return sin(val) * 0.5+0.5;
    }
  vec3 getDistortion(float progress){
        progress = clamp(progress, 0.,1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        return vec3( 
            xAmp * nsin(progress* PI * xFreq   - PI / 2. ) ,
            yAmp * nsin(progress * PI *yFreq - PI / 2.  ) ,
            0.
        );
    }
`;

export class App {
  webgl: any;
  options: Options;
  container: any;
  renderer: any;
  composer: any;
  camera: any;
  scene: any;
  fogUniforms: any;
  clock: any;
  assets: any;
  disposed: any;
  road: any;
  leftCarLights: any;
  rightCarLights: any;
  leftSticks: any;
  fovTarget: any;
  speedUpTarget: any;
  speedUp: any;
  timeOffset: any;
  renderPass: any;
  bloomPass: any;

  constructor(container, options) {
    // Init ThreeJS Basics
    this.options = options;

    if (this.options.distortion == null) {
      this.options.distortion = {
        uniforms: distortion_uniforms,
        getDistortion: distortion_vertex,
      };
    }
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
    });
    this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.composer = new EffectComposer(this.renderer);
    container.append(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      options.fov,
      container.offsetWidth / container.offsetHeight,
      0.1,
      10000,
    );
    this.camera.position.z = -5;
    this.camera.position.y = 8;
    this.camera.position.x = 0;
    // this.camera.rotateX(-0.4);
    this.scene = new THREE.Scene();

    let fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 500);
    this.scene.fog = fog;
    this.fogUniforms = {
      fogColor: { type: 'c', value: fog.color },
      fogNear: { type: 'f', value: fog.near },
      fogFar: { type: 'f', value: fog.far },
    };
    this.clock = new THREE.Clock();
    this.assets = {};
    this.disposed = false;

    // Create Objects
    this.road = new Road(this, options);
    this.leftCarLights = new CarLights(
      this,
      options,
      options.colors.leftCars,
      options.movingAwaySpeed,
      new THREE.Vector2(0, 1 - options.carLightsFade),
    );
    this.rightCarLights = new CarLights(
      this,
      options,
      options.colors.rightCars,
      options.movingCloserSpeed,
      new THREE.Vector2(1, 0 + options.carLightsFade),
    );
    this.leftSticks = new LightsSticks(this, options);

    this.fovTarget = options.fov;

    this.speedUpTarget = 0;
    this.speedUp = 0;
    this.timeOffset = 0;

    // Binds
    this.tick = this.tick.bind(this);
    this.init = this.init.bind(this);
    this.setSize = this.setSize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }
  initPasses() {
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new EffectPass(
      this.camera,
      new BloomEffect({
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0,
        resolutionScale: 1,
      }),
    );
    console.log(this.assets.smaa, this.camera);
    const smaaPass = new EffectPass(this.camera, new SMAAEffect());
    this.renderPass.renderToScreen = false;
    this.bloomPass.renderToScreen = false;
    smaaPass.renderToScreen = true;
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(smaaPass);
  }

  init() {
    this.initPasses();
    const options = this.options;
    this.road.init();
    this.leftCarLights.init();

    this.leftCarLights.mesh.position.setX(-options.roadWidth / 2 - options.islandWidth / 2);
    this.rightCarLights.init();
    this.rightCarLights.mesh.position.setX(options.roadWidth / 2 + options.islandWidth / 2);
    this.leftSticks.init();
    this.leftSticks.mesh.position.setX(-(options.roadWidth + options.islandWidth / 2));

    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.addEventListener('mouseout', this.onMouseUp);

    this.tick();
  }
  onMouseDown(ev) {
    if (this.options.onSpeedUp) this.options.onSpeedUp(ev);
    this.fovTarget = this.options.fovSpeedUp;
    this.speedUpTarget = this.options.speedUp;
  }
  onMouseUp(ev) {
    if (this.options.onSlowDown) this.options.onSlowDown(ev);
    this.fovTarget = this.options.fov;
    this.speedUpTarget = 0;
    // this.speedupLerp = 0.1;
  }
  update(delta) {
    let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
    this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001);
    this.timeOffset += this.speedUp * delta;

    let time = this.clock.elapsedTime + this.timeOffset;

    this.rightCarLights.update(time);
    this.leftCarLights.update(time);
    this.leftSticks.update(time);
    this.road.update(time);

    let updateCamera = false;
    let fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage);
    if (fovChange !== 0) {
      this.camera.fov += fovChange * delta * 6;
      updateCamera = true;
    }

    if (this.options.distortion.getJS) {
      const distortion = this.options.distortion.getJS(0.025, time);

      this.camera.lookAt(
        new THREE.Vector3(
          this.camera.position.x + distortion.x,
          this.camera.position.y + distortion.y,
          this.camera.position.z + distortion.z,
        ),
      );
      updateCamera = true;
    }
    if (updateCamera) {
      this.camera.updateProjectionMatrix();
    }
  }
  render(delta) {
    this.composer.render(delta);
  }
  dispose() {
    this.disposed = true;
  }
  setSize(width, height, updateStyles) {
    this.composer.setSize(width, height, updateStyles);
  }
  tick() {
    if (this.disposed || !this) return;
    if (resizeRendererToDisplaySize(this.renderer, this.setSize)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    const delta = this.clock.getDelta();
    this.render(delta);
    this.update(delta);
    requestAnimationFrame(this.tick);
  }
}
