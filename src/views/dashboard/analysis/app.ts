import * as THREE from 'three';
import { BasicThreeDemo } from './BasicThreeDemo';
import { Road } from './Road';
import { CarLights } from './CarLights';

function lerp(current, target, speed = 0.1, limit = 0.001) {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) {
    change = target - current;
  }
  return change;
}

export class App extends BasicThreeDemo {
  options;
  road;
  leftLights;
  rightLights;
  speedUpTarget;
  speedUp;
  timeOffset;
  fovTarget;
  constructor(container, options) {
    super(container);
    // this.camera.position.z = 50;
    // Dp stuff

    this.options = options;
    this.camera.position.z = -5;
    this.camera.position.y = 7;
    this.camera.position.x = 0;

    this.road = new Road(this, options);
    this.leftLights = new CarLights(this, options, 0xff102a, 60);
    this.rightLights = new CarLights(this, options, 0xfafafa, -60);

    this.speedUpTarget = 0;
    this.speedUp = 0;
    this.timeOffset = 0;
    this.fovTarget = 90;
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }
  override loadAssets() {
    return new Promise((resolve, reject) => {
      const manager = new THREE.LoadingManager(resolve as any);

      manager.itemStart('test');
      manager.itemEnd('test');
    });
  }
  onMouseDown(ev) {
    this.speedUpTarget = 4;
    this.fovTarget = 140;
  }
  onMouseUp(ev) {
    this.speedUpTarget = 0;
    this.fovTarget = 90;
  }
  override init() {
    const options = this.options;

    this.road.init();
    this.leftLights.init();
    this.leftLights.mesh.position.setX(-options.roadWidth / 2 - options.islandWidth / 2);

    this.rightLights.init();
    this.rightLights.mesh.position.setX(options.roadWidth / 2 + options.islandWidth / 2);

    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.addEventListener('mouseout', this.onMouseUp);
    this.tick();
  }
  override update(delta) {
    let coefficient = -60 * Math.log2(1 - 0.1);
    let lerpT = Math.exp(-coefficient * delta);
    this.speedUp += lerp(
      this.speedUp,
      this.speedUpTarget,
      // 10% each frame
      lerpT,
      0.00001,
    );
    // Also frame-dependent
    this.timeOffset += this.speedUp * delta;

    let time = this.clock.elapsedTime + this.timeOffset;
    this.leftLights.update(time);
    this.rightLights.update(time);

    let fovChange = lerp(this.camera.fov, this.fovTarget, lerpT);
    if (fovChange !== 0) {
      this.camera.fov += fovChange * delta * 6;
      this.camera.updateProjectionMatrix();
    }
  }
  override dispose() {}
}
