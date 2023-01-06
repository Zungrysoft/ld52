precision mediump float;

uniform sampler2D topTexture;
uniform sampler2D sideTexture;
uniform sampler2D bottomTexture;
uniform float textureScale;

varying vec2 uv;
varying vec3 normal;
varying vec4 worldPosition;

void main() {
  vec4 xy = texture2D(topTexture, worldPosition.xy * textureScale);
  vec4 xyBottom = texture2D(bottomTexture, worldPosition.xy * textureScale);
  vec4 xz = texture2D(sideTexture, worldPosition.xz * textureScale);
  vec4 yz = texture2D(sideTexture, worldPosition.yz * textureScale);

  vec4 result = mix(yz, xz, pow(abs(dot(normal, vec3(0.0, 1.0, 0.0))), 3.0));
  result = mix(result, normal.z > 0.0 ? xy : xyBottom, pow(abs(dot(normal, vec3(0.0, 0.0, 1.0))), 3.0));

  result *= mix(0.25, 1.0, normal.z/2.0 + 0.5);
  result *= max(normal.z, mix(0.5, 1.0, normal.x/2.0 + 0.5));
  if (result.a == 0.0) { discard; }

  gl_FragColor = vec4(result.xyz, 1.0);
}
