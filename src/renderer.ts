import { resizeCanvasToDisplaySize } from './utils'
import { Mesh } from './abstract/mesh';

export default class Desenhador {
    public canvas: HTMLCanvasElement
    public gl: WebGLRenderingContext
    public dpr: number
    public clearColor: [number, number, number, number] = [0.0, 0.0, 0.0, 1.0]
    public depthFunc: GLenum;
    public depthTest = true;

    constructor(canvas: HTMLCanvasElement, options: WebGLContextAttributes = { powerPreference: "high-performance" }) {
        this.canvas = canvas
        this.gl = this.canvas.getContext('webgl', options);
        if (!this.gl) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        this.depthFunc = this.gl.LEQUAL;
        this.dpr = Math.min(window.devicePixelRatio, 2)
    }

    draw = (meshes: Mesh[], deltaTime: number, elapsedTime: number) => {
        resizeCanvasToDisplaySize(this.canvas, window.devicePixelRatio)

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clearColor(...this.clearColor);
        this.gl.clearDepth(1.0);
        if (this.depthTest) this.gl.enable(this.gl.DEPTH_TEST);         // Enable depth testing
        this.gl.depthFunc(this.depthFunc);                              // Near things obscure far things

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (const mesh of meshes) {
            if (!mesh.readyToRender) return

            this.gl.useProgram(mesh.program);

            if (!mesh.static) mesh.calcMatrixes(this.gl)

            mesh.getAttributesFromBuffers(this.gl)

            mesh.draw(this.gl, this.gl.TRIANGLES, deltaTime, elapsedTime)
        }
    }
}