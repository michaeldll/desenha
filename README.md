# desenha
A (very) barebones WebGL framework.

## Why should I use this framework ?
You probably shouldn't.

## How do I use this framework ?
`npm i desenha`

## Examples :

Rotating cube :

```ts
import Desenhador from "desenha"
import Cube from "desenha/dist/meshes/cube"

// Renderer AKA "Desenhador"
const { gl, draw } = new Desenhador()

// Shaders
const vertex = `
    attribute vec4 aPosition;

    uniform mat4 uModelMatrix;
    uniform mat4 uProjectionMatrix;
    
    void main(void) {
        gl_Position = uProjectionMatrix * uModelMatrix * aPosition;
    }
`
const fragment = `
    void main(void) {
        gl_FragColor = vec4(vec3(1.,0.,0.),1.);
    }
`

// These will get drawn at render time
const meshes = []

// Init mesh
const cube = new Cube({
    name: 'Red cube',
    shaders: [vertex, fragment],
    locationNames: {
        attributes: ['aPosition'],
        uniforms: ['uProjectionMatrix', 'uModelMatrix']
    },
    parameters: {
        position: { x: 0, y: 0, z: -10 }
    },
    gl
})

// Executes callback each frame after being drawn
cube.addOnDrawCallback((mesh, deltaTime) => {
    mesh.rotation.x += deltaTime * 0.5
    mesh.rotation.y += deltaTime
})

meshes.push(cube)

// Render loop
let then = 0;
const update = (now: number) => {
    now *= 0.001;  // Convert to seconds
    const deltaTime = now - then;
    then = now;

    draw(meshes, deltaTime);

    requestAnimationFrame(update);
}

requestAnimationFrame(update);
```

![Red cube](https://i.imgur.com/ZoJGlo6.png)

Load shaders from files, load .obj model and shade it :

```ts
const { gl } = new Desenhador()
const loader = new OBJLoader()
const meshes = []

fetchShaders('./assets/shaders/texturedShaded/vertex.glsl', './assets/shaders/texturedShaded/fragment.glsl').then(({ vertex, fragment }) => {
    loader.load('assets/models/monitor.obj').then((geometry) => {
        const parameters = {
            position: { x: 0, y: 0, z: -1.5 },
            rotation: { x: 0, y: -0.5, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        }
        const loadedMesh = new Generic({
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

            // mesh.rotation.x += deltaTime
        }
        loadedMesh.addOnDrawCallback(setShading)

        loadedMesh.loadTexture(gl, './assets/textures/crt_layout.jpg')

        meshes.push(loadedMesh)
    })
})
```

![Shaded model](https://i.imgur.com/E9EdJXz.png)

### What does 'desenha' mean ?
It means 'draw' in Portuguese.