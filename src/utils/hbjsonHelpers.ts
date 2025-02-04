import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { 
    Scene, Mesh, MeshStandardMaterial, Shape, Vector3, 
    ExtrudeGeometry, Vector2, InstancedMesh, Matrix4
} from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Converts an HBJSON model to a GLB optimized for Deck.GL SceneGraphLayer.
 * Uses instancing, batch processing, and memory-efficient exports.
 * @param hbjson - The HBJSON model data.
 * @returns A Promise resolving to a GLB ArrayBuffer.
 */
export async function hbjsonToGLB(hbjson: any): Promise<ArrayBuffer> {
    console.log('Starting HBJSON to GLB conversion...');
    const scene = new Scene();
    const instances: Record<string, { geometry: ExtrudeGeometry; count: number; mesh: InstancedMesh }> = {};
    let processedFaces = 0;

    for (const room of hbjson.rooms) {
        for (const face of room.faces) {
            if (!face.geometry || !face.geometry.boundary) continue;
            const geometry = createWallGeometry(face);
            if (!geometry) continue;

            const material = getMaterialForFace(face);
            const type = face.face_type.toLowerCase().replace(/ /g, '_');

            if (!instances[type]) {
                instances[type] = {
                    geometry,
                    count: 0,
                    mesh: new InstancedMesh(geometry, material, 1000) // Batch size of 1000
                };
                scene.add(instances[type].mesh);
            }
            
            const transform = new Matrix4();
            transform.setPosition(new Vector3(0, 0, 0)); // Adjust if needed
            instances[type].mesh.setMatrixAt(instances[type].count++, transform);
            processedFaces++;
        }
    }
    
    for (const type in instances) {
        instances[type].mesh.instanceMatrix.needsUpdate = true;
    }
    
    console.log(`Processed ${processedFaces} faces. Exporting scene to GLB...`);
    const glbBuffer = await exportSceneToGLB(scene);
    console.log('Scene exported to GLB successfully.');
    return glbBuffer;
}

/**
 * Creates an optimized Three.js wall geometry with holes.
 * @param face - The HBJSON face object.
 * @returns A Three.js ExtrudeGeometry object.
 */
function createWallGeometry(face: any): ExtrudeGeometry | null {
    if (!face.geometry || !Array.isArray(face.geometry.boundary) || face.geometry.boundary.length < 3) {
        console.warn("Invalid face geometry, skipping:", face);
        return null;
    }

    const boundary = face.geometry.boundary.map((v: number[]) => new Vector3(v[0], v[1], v[2]));
    const shape = new Shape(boundary.map((v: Vector3) => new Vector2(v.x, v.y)));

    if (face.apertures) {
        for (const aperture of face.apertures) {
            if (!aperture.geometry || !Array.isArray(aperture.geometry.boundary) || aperture.geometry.boundary.length < 3) continue;
            const holeBoundary = aperture.geometry.boundary.map((v: number[]) => new Vector3(v[0], v[1], v[2]));
            const hole = new Shape(holeBoundary.map((v: Vector3) => new Vector2(v.x, v.y)));
            shape.holes.push(hole);
        }
    }

    const depth = face.thickness || 0.3;
    let geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    return mergeVertices(geometry) as ExtrudeGeometry;
}

/**
 * Generates a single material per face type.
 * @param face - The HBJSON face object.
 * @returns A MeshStandardMaterial.
 */
function getMaterialForFace(face: any): MeshStandardMaterial {
    const colors: Record<string, number> = {
        walls: 0xffb400,
        windows: 0x4444ff,
        roofs: 0xaa4444,
        floors: 0x40b4ff,
        doors: 0xff0000,
        default: 0x808080,
    };

    const type = face.face_type.toLowerCase().replace(/ /g, '_');
    return new MeshStandardMaterial({
        color: colors[type] || colors.default,
        transparent: type === 'windows',
        opacity: type === 'windows' ? 0.5 : 1.0,
        metalness: type === 'windows' ? 0.8 : 0.2,
        roughness: type === 'windows' ? 0.1 : 0.8,
    });
}

/**
 * Asynchronously exports a Three.js scene to a GLB format.
 * @param scene - The Three.js scene.
 * @returns A Promise resolving to a GLB ArrayBuffer.
 */
function exportSceneToGLB(scene: Scene): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const callback = () => {
            const exporter = new GLTFExporter();
            exporter.parse(
                scene,
                (gltf) => {
                    if (gltf instanceof ArrayBuffer) {
                        resolve(gltf);
                    } else {
                        reject(new Error('GLB export failed: Unexpected format'));
                    }
                },
                (error) => reject(new Error('GLB export failed: ' + error.message)),
                { binary: true }
            );
        };

        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(callback);
        } else {
            setTimeout(callback, 0);
        }
    });
}
