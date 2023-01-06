precision mediump float;

uniform sampler2D texture;

varying vec4 color;

void main() {
  vec4 result = texture2D(texture, gl_PointCoord) * color;
  if (result.a == 0.0) { discard; }
  gl_FragColor = result;
  //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
