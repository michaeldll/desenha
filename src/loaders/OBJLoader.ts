import { Geometry } from "../types";

export default class OBJLoader {
	async load(url: string) {
		const response = await fetch(url);
		const textContent = await response.text();

		const { positions, uvs, normals } = this.parse(textContent);
		const geometry: Geometry = {
			positions: new Float32Array(positions),
			uvs: new Float32Array(uvs),
			normals: new Float32Array(normals),
		};

		return geometry;
	}

	// https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
	parse(text: string) {
		let objName = "";

		// because indices are base 1 let's just fill in the 0th data
		const objPositions = [[0, 0, 0]];
		const objUvs = [[0, 0]];
		const objNormals = [[0, 0, 0]];

		// same order as `f` indices
		const objVertexData = [objPositions, objUvs, objNormals];

		// same order as `f` indices
		let webglVertexData = [
			[], // positions
			[], // texcoords
			[], // normals
		];

		function addVertex(vert: string) {
			const ptn = vert.split("/");
			ptn.forEach((objIndexStr: string, i: number) => {
				if (!objIndexStr) {
					return;
				}
				const objIndex = parseInt(objIndexStr);
				const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
				webglVertexData[i].push(...objVertexData[i][index]);
			});
		}

		const keywords = {
			usemtl(parts) {
				// Material
			},
			mtllib(parts) {
				// Specifies separate files that contain material info
			},
			s(parts) {
				// Smoothing group off or on
			},
			o(parts) {
				objName = parts[0];
			},
			v(parts) {
				objPositions.push(parts.map(parseFloat));
			},
			vn(parts) {
				objNormals.push(parts.map(parseFloat));
			},
			vt(parts) {
				// should check for missing v and extra w?
				objUvs.push(parts.map(parseFloat));
			},
			f(parts) {
				const numTriangles = parts.length - 2;
				for (let tri = 0; tri < numTriangles; ++tri) {
					addVertex(parts[0]);
					addVertex(parts[tri + 1]);
					addVertex(parts[tri + 2]);
				}
			},
		};

		const keywordRE = /(\w*)(?: )*(.*)/;
		const lines = text.split("\n");
		for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
			const line = lines[lineNo].trim();
			if (line === "" || line.startsWith("#")) {
				continue;
			}
			const m = keywordRE.exec(line);
			if (!m) {
				continue;
			}
			const [, keyword, unparsedArgs] = m;
			const parts = line.split(/\s+/).slice(1);
			const handler = keywords[keyword];
			if (!handler) {
				console.warn("unhandled keyword:", keyword); // eslint-disable-line no-console
				continue;
			}
			handler(parts, unparsedArgs);
		}

		return {
			objName,
			positions: webglVertexData[0],
			uvs: webglVertexData[1],
			normals: webglVertexData[2],
		};
	}
}
