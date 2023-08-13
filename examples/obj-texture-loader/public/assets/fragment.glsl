precision mediump float;

uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vColor;

void main(void) {
    vec4 texel = texture2D(uTexture, vUv);
    gl_FragColor = vec4(texel.rgb * vColor, texel.a);
}