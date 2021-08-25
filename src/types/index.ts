import { Mesh } from "../abstract/mesh"

export type Buffers = {
    [bufferName: string]: WebGLBuffer | null
}

export type Locations = {
    attributes: {
        [attributeName: string]: WebGLUniformLocation | -1
    },
    uniforms: {
        [uniformName: string]: WebGLUniformLocation | null
    }
}

export type Geometry = {
    positions?: Float32Array // For easier super() behavior in meshes/
    normals?: Float32Array
    indices?: Uint16Array
    colors?: Float32Array
    uvs?: Float32Array
}

export type Vector3 = {
    x: number,
    y: number,
    z: number
}

export type MeshParameters = {
    translation: Vector3,
    rotation: Vector3,
    scale: Vector3
}

export type MeshConstructor = {
    program: WebGLProgram,
    locationNames: {
        attributes: string[]
        uniforms: string[]
    }
    gl: WebGLRenderingContext
    parameters?: MeshParameters
    name?: string
}

export type DrawCallback = (mesh: Mesh, deltaTime: number) => void