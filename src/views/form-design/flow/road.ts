import * as THREE from 'three';
import type { Options } from '.';

const fragmentShader = `
  uniform vec3 uColor;
  void main(){
    gl_FragColor = vec4(uColor,1.);
  }
`;

const vertexShader = `
  void main(){
    vec3 transformed = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.);
  }
`;

export class Road {
  webgl: any;
  options: Options;

  constructor(webgl: any, options: Options) {
    this.webgl = webgl;
    this.options = options;
  }

  init() {
    const options = this.options;

    const geometry = new THREE.PlaneGeometry(options.width, options.length, 20, 200);

    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        //uColor: new THREE.Uniform(new THREE.Color(0x101012)),
        uColor: new THREE.Uniform(new THREE.Color(0x071749)),
      },
    });

    const mesh = new THREE.Mesh(geometry, material);

    /* mesh.rotation.x = -Math.PI / 2;
    mesh.position.z = -options.length / 2; */

    this.webgl.scene.add(mesh);
  }
}
