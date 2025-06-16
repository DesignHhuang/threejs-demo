export const carLightsFragment = `
  varying vec3 vColor;
  varying vec2 vUv; 

  void main() {
    vec3 color = vec3(vColor);
    gl_FragColor = vec4(color,1.);
  }
`;

export const carLightsVertex = `
  attribute vec3 aOffset;
  attribute vec3 aMetrics;
  attribute vec3 aColor;

  uniform float uTravelLength;

  varying vec2 vUv; 
  varying vec3 vColor; 

  void main() {
    vec3 transformed = position.xyz;
    float radius = aMetrics.r;
    float myLength = aMetrics.g;

    transformed.xy *= radius ;
    transformed.z *= myLength;

    transformed.z = transformed.z + aOffset.z;
    transformed.xy += aOffset.xy;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;

    vUv = uv;
    vColor = aColor;
  }`;
