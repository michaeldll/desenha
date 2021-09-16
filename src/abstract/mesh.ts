import { mat4, vec3 } from 'gl-matrix'
import { Locations, Buffers, Geometry, MeshConstructor, DrawCallback } from "../types"
import { getShaderProgram } from '../utils'

export abstract class Mesh {
    name: string
    readyToRender: boolean
    buffers: Buffers
    geometry: Geometry
    program: WebGLProgram
    locations: Locations
    modelMatrix: ReturnType<typeof mat4.create>
    projectionMatrix: ReturnType<typeof mat4.create>
    position: ReturnType<typeof vec3.create>
    rotation: ReturnType<typeof vec3.create>
    scale: ReturnType<typeof vec3.create>
    onDrawCallbacks: DrawCallback[]

    constructor({ shaders, name, locationNames, parameters, gl }: MeshConstructor) {
        this.geometry = {}
        this.buffers = {}
        this.locations = { attributes: {}, uniforms: {} }
        this.readyToRender = true
        this.onDrawCallbacks = []

        this.program = getShaderProgram(gl, shaders[0], shaders[1])

        for (const attributeName of locationNames.attributes) {
            this.locations.attributes[attributeName] = gl.getAttribLocation(this.program, attributeName)
        }
        for (const uniformName of locationNames.uniforms) {
            this.locations.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName)
        }

        this.position = vec3.fromValues(0, 0, 0)
        this.rotation = vec3.fromValues(0, 0, 0)
        this.scale = vec3.fromValues(1, 1, 1)

        if (parameters) {
            if (parameters.position) vec3.set(this.position, parameters.position.x, parameters.position.y, parameters.position.z)
            if (parameters.rotation) vec3.set(this.rotation, parameters.rotation.x, parameters.rotation.y, parameters.rotation.z)
            if (parameters.scale) vec3.set(this.scale, parameters.scale.x, parameters.scale.y, parameters.scale.z)
        }

        name ? this.name = name : this.name = ""
    }

    addOnDrawCallback = (callback: DrawCallback) => {
        this.onDrawCallbacks.push(callback)
    }

    // Set a 2D texture
    loadTexture = (gl: WebGLRenderingContext, path: string) =>
        new Promise((resolve: (value: void) => void) => {
            const texture = gl.createTexture();
            const image = new Image();
            image.src = path;
            image.onload = () => {
                // Flip the image's y axis
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

                // Enable texture 0
                gl.activeTexture(gl.TEXTURE0);

                // Set the texture's target (2D or cubemap)
                gl.bindTexture(gl.TEXTURE_2D, texture);

                // Stretch/wrap options
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                // Bind image to texture
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

                // Mipmaps
                gl.generateMipmap(gl.TEXTURE_2D);

                // Pass texture 0 to the sampler
                gl.useProgram(this.program);
                gl.uniform1i(this.locations.uniforms.texture, 0);
                resolve()
            }
        })

    calcMatrixes = (gl: WebGLRenderingContext) => {
        // Projection
        this.projectionMatrix = mat4.create();

        // Perspective
        {
            const glCanvas = gl.canvas as HTMLCanvasElement
            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = glCanvas.clientWidth / glCanvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;

            mat4.perspective(
                this.projectionMatrix,
                fieldOfView,
                aspect,
                zNear,
                zFar
            );
        }

        // Orthographic
        // {
        //     const glCanvas = gl.canvas as HTMLCanvasElement
        //     const aspect = glCanvas.clientWidth / glCanvas.clientHeight;
        //     const left = -5 * aspect;
        //     const right = 5 * aspect;
        //     const bottom = 5;
        //     const top = -5;
        //     const near = 0.1;
        //     const far = 100;

        //     mat4.ortho(projectionMatrix, left, right, bottom, top, near, far)
        // }

        this.modelMatrix = mat4.create();

        mat4.scale(this.modelMatrix,
            this.modelMatrix,
            [this.scale[0], this.scale[1], this.scale[2]])
        mat4.translate(this.modelMatrix,
            this.modelMatrix,
            [this.position[0], this.position[1], this.position[2]]);
        mat4.rotate(this.modelMatrix,
            this.modelMatrix,
            this.rotation[0],     // amount to rotate in radians
            [1, 0, 0]);       // axis to rotate around (X)
        mat4.rotate(this.modelMatrix,  // destination matrix
            this.modelMatrix,
            this.rotation[1],// amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)
        mat4.rotate(this.modelMatrix,
            this.modelMatrix,
            this.rotation[2],     // amount to rotate in radians
            [0, 0, 1]);       // axis to rotate around (Z)

        // Set shader uniforms
        gl.uniformMatrix4fv(
            this.locations.uniforms.uProjectionMatrix,
            false,
            this.projectionMatrix);
        gl.uniformMatrix4fv(
            this.locations.uniforms.uModelMatrix,
            false,
            this.modelMatrix);
    }

    getAttributesFromBuffers = (gl: WebGLRenderingContext) => {
        const { positions, indices, colors, uvs, normals } = this.buffers

        if (positions && this.locations.attributes.aPosition > -1) {

            // Pull out the positions from the position
            // buffer into the vertexPosition attribute
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);

                const index = this.locations.attributes.aPosition as number
                const numComponents = 3;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.vertexAttribPointer(
                    index,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);

                gl.enableVertexAttribArray(index);
            }
        }

        if (uvs && this.locations.attributes.aUv > -1) {
            // Pull out the texture coordinates from the uv buffer
            // into the uv attribute.
            {

                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uvs);

                const index = this.locations.attributes.aUv as number
                const size = 2;          // 2 components per iteration
                const type = gl.FLOAT;   // the data is 32bit floats
                const normalize = false; // don't normalize the data
                const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                const offset = 0;        // start at the beginning of the buffer

                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(index, size, type, normalize, stride, offset);
            }
        }

        if (colors && this.locations.attributes.aColor > -1) {
            // Pull out the colors from the color buffer
            // into the vertexColor attribute.
            {
                const index = this.locations.attributes.aColor as number
                const size = 4;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colors);
                gl.vertexAttribPointer(
                    index,
                    size,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(index);
            }
        }

        if (normals && this.locations.attributes.aNormal > -1) {
            {
                const index = this.locations.attributes.aNormal as number
                const size = 3;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals);
                gl.vertexAttribPointer(
                    index,
                    size,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(index);
            }
        }

        if (indices) {
            // Tell WebGL which indices to use to index the vertices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        }
    }

    setBuffers = (gl: WebGLRenderingContext) => {
        const { positions, indices, colors, uvs, normals } = this.geometry

        if (positions) {
            this.setBuffer(gl, 'positions')
        }

        if (colors) {
            this.setBuffer(gl, 'colors')
        }

        if (uvs) {
            this.setBuffer(gl, 'uvs')
        }

        if (normals) {
            this.setBuffer(gl, 'normals')
        }

        if (indices) {
            // Build the element array buffer; this specifies the indices
            // into the vertex arrays for each face's vertices.
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            this.buffers.indices = indexBuffer
        }
    }

    setBuffer = (gl: WebGLRenderingContext, nameProp: "positions" | "normals" | "indices" | "colors" | "uvs") => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.geometry[nameProp] as BufferSource, gl.STATIC_DRAW);
        this.buffers[nameProp] = buffer
    }

    // LINE_LOOP for wireframe-like aspect
    draw = (gl: WebGLRenderingContext, mode: WebGLRenderingContextBase["TRIANGLES"] | WebGLRenderingContextBase["LINES"] | WebGLRenderingContextBase["LINE_LOOP"], deltaTime: number) => {
        if (typeof this.geometry.indices !== "undefined" && this.geometry.indices.length && this.geometry.positions) {
            const vertexCount = this.geometry.positions.length / (this.geometry.positions.length / this.geometry.indices.length);
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(mode, vertexCount, type, offset);
        } else if (this.geometry.positions) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);


            gl.enableVertexAttribArray(this.locations.attributes.aPosition as number);

            {
                const size = 3;          // 2 components per iteration
                const type = gl.FLOAT;   // the data is 32bit floats
                const normalize = false; // don't normalize the data
                const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                const offset = 0;        // start at the beginning of the buffer
                gl.vertexAttribPointer(
                    this.locations.attributes.aPosition as number, size, type, normalize, stride, offset);
            }

            {
                const primitiveType = gl.TRIANGLES;
                const offset = 0;
                const count = this.geometry.positions.length / 3;
                gl.drawArrays(primitiveType, offset, count);
            }
        }

        for (const callback of this.onDrawCallbacks) {
            callback(this, deltaTime)
        }
    }
}