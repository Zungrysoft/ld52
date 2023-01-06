attribute vec4 vertexPosition;
attribute vec4 vertexColor;
attribute float vertexSize;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

varying vec4 color;
varying vec4 worldPosition;
varying vec4 viewPosition;

void main() {
  color = vertexColor;
  worldPosition = modelMatrix * vertexPosition;
  viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vertexPosition;
  gl_PointSize = gl_Position.w > 0.0 ? vertexSize / gl_Position.w : 0.0;
}
