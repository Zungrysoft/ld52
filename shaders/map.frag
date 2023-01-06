precision mediump float;

uniform sampler2D otherTexture;
uniform sampler2D topTexture;
uniform sampler2D bottomTexture;
uniform float textureScale;
uniform int blending;

varying vec2 uv;
varying vec3 normal;
varying vec4 worldPosition;

void main() {
  // basic XY projection UV mapping
  vec2 uvNew = vec2(uv.xy);
  if (textureScale > 0.0) {
    uvNew = vec2(worldPosition.xy * textureScale);
  }

  // walls
  if (abs(normal.z) < 0.4) {
    if (abs(normal.y) <= 0.05) {
      uvNew.x = -1.0 * worldPosition.y*textureScale;
      uvNew.y = -1.0 * worldPosition.z*textureScale;
    } else {
      uvNew.x = -1.0 * worldPosition.x*textureScale / normal.y;
      uvNew.y = -1.0 * worldPosition.z*textureScale;
    }
  }

  // tops
  vec4 result = texture2D(otherTexture, uvNew);
  if (normal.z > 0.7) {
    //if (blending == 1) {
      result = mix(result, texture2D(topTexture, uvNew), clamp((normal.z-0.7)*10.0, 0.0, 1.0));
    //} else {
      ////result = texture2D(topTexture, uvNew);
    //}
  }

  // basic shading
  result *= mix(0.25, 1.0, normal.z/2.0 + 0.5);
  result *= mix(0.5, 1.0, normal.x/2.0 + 0.5);
  if (result.a == 0.0) { discard; }

  gl_FragColor = vec4(result.xyz, 1.0);
}
