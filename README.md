# desenha
A barebones WebGL framework.
## Why should I use this framework ?
You probably don't want to.

`npm i desenha`

```ts
    import Desenhador from "desenha"
    import Cube from "desenha/meshes/cube"

    const renderer = new Desenhador()

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

    // This array can be updated at any time
    // and the meshes within will get drawn
    // at render time
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
    cube.addOnDrawCallback((mesh: Mesh, deltaTime: number) => {
        mesh.rotation.x += deltaTime * 0.5
        mesh.rotation.y += deltaTime
    })
    meshes.push(cube)

    let then = 0;
    const update = (now: number) => {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        renderer.drawScene(meshes, deltaTime);

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
```

![Red cube](https://i.imgur.com/ZoJGlo6.png)

### What does 'desenha' mean ?
It means 'draw' in Portuguese.