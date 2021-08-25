# desenha
A (very) barebones WebGL framework.

## Why should I use this framework ?
You probably shouldn't.

## How do I use this framework ?
`npm i desenha`

then

```ts
import Desenhador from "desenha"
import Cube from "desenha/dist/meshes/cube"

// Renderer AKA "Desenhador"
const renderer = new Desenhador()

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
    gl: renderer.gl
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

    renderer.drawScene(meshes, deltaTime);

    requestAnimationFrame(update);
}

requestAnimationFrame(update);
```

Tada ! You have drawn a red cube.
![Red cube](https://i.imgur.com/ZoJGlo6.png)

### What does 'desenha' mean ?
It means 'draw' in Portuguese.