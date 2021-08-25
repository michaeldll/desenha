import { Mesh } from "../abstract/mesh";
import { Geometry, MeshConstructor } from "../types";

export default class Generic extends Mesh {
    constructor({ program, locationNames, gl, parameters, name, geometry }: MeshConstructor & { geometry: Geometry }) {
        super({ program, locationNames, gl, parameters, name })

        this.geometry = geometry

        this.setBuffers(gl)
    }
}