attribute vec4 aPosition;
attribute vec4 aVertexColor;
attribute vec2 aUv;
attribute vec4 aNormal;

uniform sampler2D uTexture;
uniform vec3 uBaseColor;
uniform vec3 uAmbientLight;
uniform vec3 uLightColor;
uniform vec3 uLightDirection;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vColor;
varying vec2 vUv;

void main(void) {
    // Angle between normal and light direction
    float normalDotLight = max(dot(uLightDirection, normalize(vec3(aNormal))), 0.0);

    // Diffuse light proportional to this angle
    vColor = uLightColor * uBaseColor.rgb * normalDotLight;

    // Ambient light
    vColor *= uAmbientLight;
    vColor += uAmbientLight;

    vUv = aUv;
    
    gl_Position = uProjectionMatrix * uModelMatrix * aPosition;
}