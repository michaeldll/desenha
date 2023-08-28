# desenha
A barebones WebGL library. Inspired by https://webglfundamentals.org/ and [OGL](https://github.com/oframe/ogl).
You probably shouldn't use this.

## Example :

```ts
import { Desenhador, Cube } from "desenha"

// Renderer
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
    mesh.rotation[0] += 0.01
    mesh.rotation[1] += 0.01
})

meshes.push(cube)

// Render loop
let then = 0;
const update = (now: number) => {
    const deltaTime = now - then;
    then = now;

    draw(meshes, deltaTime);

    requestAnimationFrame(update);
}

requestAnimationFrame(update);
```

![Red cube](https://i.imgur.com/ZoJGlo6.png)

More examples available under `/examples`:
- Fullscreen shader
- OBJ model and texture loading

### What does 'desenha' mean ?
It means 'draw' in Portuguese.
