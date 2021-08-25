import { resizeCanvasToDisplaySize } from './utils'
import { Mesh } from './abstract/mesh';
export default class Desenhador {
    canvas: HTMLCanvasElement
    gl: WebGLRenderingContext

    constructor(options: WebGLContextAttributes = { powerPreference: "high-performance" }) {
        this.canvas = document.querySelector('canvas');
        this.gl = this.canvas.getContext('webgl', options);

        if (!this.gl) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }
    }

    drawScene = (meshes: Mesh[], deltaTime: number) => {
        resizeCanvasToDisplaySize(this.canvas, window.devicePixelRatio)

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
        this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (const mesh of meshes) {
            if (!mesh.readyToRender) return

            this.gl.useProgram(mesh.program);

            mesh.calcMatrixes(this.gl)

            mesh.getAttributesFromBuffers(this.gl)

            mesh.draw(this.gl, this.gl.TRIANGLES, deltaTime)
        }
    }
}