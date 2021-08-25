import { Mesh } from "../abstract/mesh";
import { MeshConstructor } from "../types";

export default class Plane extends Mesh {
    constructor({ shaders, locationNames, gl, parameters, name }: MeshConstructor) {
        super({ shaders, locationNames, gl, parameters, name })

        this.geometry = {
            positions: new Float32Array([
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0,
                1.0, 1.0, 0.0,
                -1.0, 1.0, 0.0,
            ]),
            normals: new Float32Array([
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
            ]),
            indices: new Uint16Array([
                0, 1, 2, 0, 2, 3,
            ]),
            uvs: new Float32Array([
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            ])
        }

        this.setBuffers(gl)
    }
}