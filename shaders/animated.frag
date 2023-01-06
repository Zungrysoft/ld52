precision mediump float;

uniform sampler2D texture;
uniform vec4 color;
uniform vec2 cellSize;
uniform vec2 cellIndex;

varying vec2 uv;

void main() {
  vec2 uvNew = vec2(uv.x, uv.y);
  uvNew.x *= cellSize.x;
  uvNew.y *= cellSize.y;
  uvNew.x += cellIndex.x * cellSize.x;
  uvNew.y += cellIndex.y * cellSize.y;
  vec4 result = texture2D(texture, uvNew) * color;
  if (result.a == 0.0) { discard; }
  gl_FragColor = result;
}
