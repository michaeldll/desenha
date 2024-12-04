import "./scss/global.scss";

import Desenhador from "../../../src/renderer";
import { fetchShaders } from "../../../src/utils";
import OBJLoader from "../../../src/loaders/OBJLoader";
import Mesh from "../../../src/abstract/mesh";

const { gl, draw } = new Desenhador(document.querySelector(".canvas-gl"))
const loader = new OBJLoader()
const meshes = []

fetchShaders('./assets/vertex.glsl', './assets/fragment.glsl').then(({ vertex, fragment }) => {
    loader.load('assets/monitor.obj').then((geometry) => {
        const parameters = {
            position: { x: 0, y: 0, z: -1.5 },
            rotation: { x: 0, y: -0.5, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        }
        const loadedMesh = new Mesh({
            name: 'monitor',
            shaders: [vertex, fragment],
            locationNames: {
                attributes: ['aPosition', 'aNormal', 'aUv'],
                uniforms: [
                    'uProjectionMatrix',
                    'uModelMatrix',
                    'uLightColor',
                    'uLightDirection',
                    'uBaseColor',
                    'uAmbientLight',
                    'uTexture'
                ]
            },
            parameters,
            geometry,
            gl
        })

        const setShading = (mesh, deltaTime) => {
            // Base color
            gl.uniform3f(mesh.locations.uniforms.uBaseColor, 1, 1, 1);

            // Diffuse light color
            gl.uniform3f(mesh.locations.uniforms.uLightColor, 2.5, 2.5, 2.5);

            // Ambient light color
            gl.uniform3f(mesh.locations.uniforms.uAmbientLight, 0.1, 0.1, 0.1);

            // Light direction
            gl.uniform3f(mesh.locations.uniforms.uLightDirection, 0, -1, 1);
        }
        loadedMesh.addOnDrawCallback(setShading)

        loadedMesh.loadTexture(gl, './assets/monitor.jpg', 'uTexture', {
            minFilter: gl.LINEAR_MIPMAP_LINEAR,
            magFilter: gl.LINEAR,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            flip: true,
            mipmap: true
        })

        meshes.push(loadedMesh)

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
    })
})