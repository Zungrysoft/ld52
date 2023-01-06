attribute vec4 vertexPosition;
attribute vec2 vertexTexture;
attribute vec3 vertexNormal;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform vec3 axis;

varying vec2 uv;
varying vec3 normal;

void main() {
  normal = (modelMatrix * vec4(vertexNormal.xyz, 1.0)).xyz;
  uv = vertexTexture;

  vec4 position = vertexPosition;
  vec3 axis2 = normalize(cross(axis, vec3(viewMatrix[0].z, viewMatrix[1].z, viewMatrix[2].z)));
  position += (vertexTexture.x*2.0 -1.0)  * vec4(axis2.xyz, 0.0) * vertexNormal.x;
  position += (vertexTexture.y*-2.0 +1.0) * vec4(axis.xyz,  0.0) * vertexNormal.x;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
}
