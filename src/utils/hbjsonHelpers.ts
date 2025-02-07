import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// --- Global constants and mappings ---
const SBE_COLORS: Record<string, number[]> = {
  walls: [0.8, 0.8, 0.8],
  interior_walls: [0.99, 0.98, 0.97],
  roofs: [0.2, 0.2, 0.2],
  ceilings: [1.0, 1.0, 1.0],
  exterior_floors: [0.9, 0.88, 0.85],
  interior_floors: [0.95, 0.92, 0.9],
  air_walls: [0.99, 0.99, 0.99],
  apertures: [0.7, 0.75, 0.92],
  interior_apertures: [0.85, 0.88, 0.92],
  doors: [0.2, 0.18, 0.16],
  interior_doors: [0.3, 0.28, 0.26],
  outdoor_shades: [0.65, 0.65, 0.65],
  indoor_shades: [0.75, 0.75, 0.75],
  shade_meshes: [0.55, 0.55, 0.55],
};

const FACE_TYPE_MAPPING: Record<string, string> = {
  Wall: 'walls',
  RoofCeiling: 'roofs',
  Floor: 'interior_floors', // Updated later based on boundary conditions.
};

const APERTURE_OFFSET = 0.1;

// --- Utility Functions ---
function getRotationMatrix(rotate: boolean = false): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();
  if (rotate) {
    matrix.makeRotationX(-Math.PI / 2); // Rotate -90° about the X-axis
  }
  return matrix;
}

function computeFaces(numVertices: number): number[][] {
  const faces = [];
  for (let i = 1; i < numVertices - 1; i++) {
    faces.push([0, i, i + 1]);
  }
  return faces;
}

// --- Geometry Processing Functions ---
function processAperture(
  aperture: any,
  faceType: string,
  rotationMatrix: THREE.Matrix4
): { vertices: THREE.Vector3[]; faces: number[][]; color: number[]; category: string } | null {
  const boundary = aperture.geometry?.boundary;
  if (!boundary || boundary.length < 3) return null;

  const vertices = boundary.map((v: number[]) => new THREE.Vector3(...v));
  vertices.forEach((v: THREE.Vector3) => v.applyMatrix4(rotationMatrix));

  // Calculate normal from first triangle
  const normal = new THREE.Triangle(
    vertices[0],
    vertices[1],
    vertices[2]
  ).getNormal(new THREE.Vector3());
  normal.normalize();

  // Offset vertices along normal
  vertices.forEach((v: THREE.Vector3) => v.add(normal.clone().multiplyScalar(APERTURE_OFFSET)));

  const faces = computeFaces(vertices.length);
  const category = faceType === 'Wall' ? 'apertures' : 
                  faceType === 'RoofCeiling' ? 'interior_apertures' : 'apertures';
  const color = SBE_COLORS[category] || [1, 1, 1];

  return { vertices, faces, color, category };
}

function processFace(face: any, rotationMatrix: THREE.Matrix4): Record<string, { vertices: THREE.Vector3[]; faces: number[][]; color: number[] }[]> {
  const results: Record<string, { vertices: THREE.Vector3[]; faces: number[][]; color: number[] }[]> = {};
  Object.keys(SBE_COLORS).forEach((cat) => (results[cat] = []));

  const boundary = face.geometry?.boundary;
  if (!boundary || boundary.length < 3) return results;

  const vertices = boundary.map((v: number[]) => new THREE.Vector3(...v));
  vertices.forEach((v: THREE.Vector3) => v.applyMatrix4(rotationMatrix));

  const faces = computeFaces(vertices.length);
  const faceType = face.face_type || 'Wall';
  let category = FACE_TYPE_MAPPING[faceType] || 'walls';

  if (faceType === 'Floor') {
    const bc = face.boundary_condition?.type || '';
    category = bc === 'Ground' ? 'exterior_floors' : 'interior_floors';
  }

  const color = SBE_COLORS[category] || [1, 1, 1];
  results[category].push({ vertices, faces, color });

  face.apertures?.forEach((aperture: any) => {
    const apertureData = processAperture(aperture, faceType, rotationMatrix);
    if (apertureData) {
      results[apertureData.category].push({
        vertices: apertureData.vertices,
        faces: apertureData.faces,
        color: apertureData.color,
      });
    }
  });

  return results;
}

function processRoom(room: any, rotationMatrix: THREE.Matrix4): Record<string, { vertices: THREE.Vector3[]; faces: number[][]; color: number[] }[]> {
  const roomResults: Record<string, { vertices: THREE.Vector3[]; faces: number[][]; color: number[] }[]> = {};
  Object.keys(SBE_COLORS).forEach((cat) => (roomResults[cat] = []));
  
  room.faces?.forEach((face: any) => {
    const faceResults = processFace(face, rotationMatrix);
    Object.keys(faceResults).forEach((cat) => {
      roomResults[cat].push(...faceResults[cat]);
    });
  });

  return roomResults;
}

// --- GLB Export ---
async function exportSceneToGLB(scene: THREE.Scene): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
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
      // Remove explicit Error type - let TypeScript infer or cast as any.
      (error: any) => reject(new Error('GLB export failed: ' + (error.message || error))),
      { binary: true }
    );
  });
}

// --- Export Functions ---
export async function hbjsonToGLB(hbjsonData: any, rotate: boolean = false): Promise<ArrayBuffer> {
  const rotationMatrix = getRotationMatrix(rotate);
  const combinedResults: Record<string, { vertices: THREE.Vector3[]; faces: number[][]; color: number[] }[]> = {};
  Object.keys(SBE_COLORS).forEach((cat) => (combinedResults[cat] = []));

  hbjsonData.rooms?.forEach((room: any) => {
    const roomResults = processRoom(room, rotationMatrix);
    Object.keys(roomResults).forEach((cat) => {
      combinedResults[cat].push(...roomResults[cat]);
    });
  });

  const scene = new THREE.Scene();
  Object.keys(combinedResults).forEach((cat) => {
    const items = combinedResults[cat];
    if (items.length === 0) return;

    let allVertices: THREE.Vector3[] = [];
    let allFaces: number[] = [];
    let vertexOffset = 0;

    // Combine all geometries for this category
    items.forEach(item => {
      allVertices.push(...item.vertices);
      const offsetFaces = item.faces.map(face =>
        face.map(index => index + vertexOffset)
      ).flat();
      allFaces.push(...offsetFaces);
      vertexOffset += item.vertices.length;
    });

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(allVertices.length * 3);
    allVertices.forEach((vertex, i) => {
      positions[i * 3] = vertex.x;
      positions[i * 3 + 1] = vertex.y;
      positions[i * 3 + 2] = vertex.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(allFaces);
    geometry.computeVertexNormals();

    // Use the statically imported mergeVertices
    const mergedGeometry = mergeVertices(geometry);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(...items[0].color),
      metalness: 0.2,
      roughness: 0.8,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(mergedGeometry, material);
    mesh.name = cat;
    scene.add(mesh);
  });

  return await exportSceneToGLB(scene);
}
