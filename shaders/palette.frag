precision mediump float;

uniform sampler2D original;
uniform sampler2D map;

varying vec2 uv;

void main() {
  float base = 64.0;
  float size = 512.0;

  vec4 c = texture2D(original, uv);
  float i = floor(mix(0.0, base-1.0, c.r))
    + floor(mix(0.0, base-1.0, c.g))*base
    + floor(mix(0.0, base-1.0, c.b))*base*base;

  gl_FragColor = texture2D(map, vec2(i/size + 0.5, mod(i, size) + 0.5)/size);
}
