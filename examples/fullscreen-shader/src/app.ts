import "./scss/global.scss";
import Desenhador from "../../../src/renderer";
import planeGeometry from "../../../src/geometries/planeGeometry";
import Mesh from "../../../src/abstract/mesh";

// Renderer
const { gl, draw, canvas, dpr } = new Desenhador(document.querySelector(".canvas-gl"))

// Shaders
const vertex = /*glsl*/`
    attribute vec4 aPosition;
    attribute vec2 aUv;

    varying vec2 vUv;
    
    void main(void) {
        vUv = aUv;
        gl_Position = aPosition;
    }
`
const fragment = /*glsl*/`
    precision highp float; 

    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;

    void main() { 
        gl_FragColor = vec4(vec3(vUv, 0.), 1.);
    } 
`

const meshes = []

// Init mesh
const plane = new Mesh({
    geometry: planeGeometry,
    name: 'Plane',
    shaders: [vertex, fragment],
    locationNames: {
        attributes: ['aPosition', 'aUv'],
        uniforms: ['uTime', 'uResolution']
    },
    parameters: {},
    gl
})
plane.static = true

const setUniforms = (mesh, deltaTime: number, elapsedTime: number) => {
    // Time
    gl.uniform1f(mesh.locations.uniforms.uTime, elapsedTime);

    // Resolution
    gl.uniform2f(mesh.locations.uniforms.uResolution, canvas.offsetWidth * dpr, canvas.offsetHeight * dpr);
}
plane.addOnDrawCallback(setUniforms)

meshes.push(plane)

// Render loop
let then = 0;
let elapsedTime = 0;
const update = (now: number) => {
    now *= 0.001;  // Convert to seconds
    const deltaTime = now - then;
    then = now;
    elapsedTime += deltaTime;

    draw(meshes, deltaTime, elapsedTime);

    requestAnimationFrame(update);
}

requestAnimationFrame(update);