import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { hbjsonToGLB } from '../hbjsonHelpers';

const handleResponse = async (response: Response) => {
  const text = await response.text();
  if (response.headers.get('content-type')?.includes('application/json')) {
    return JSON.parse(text);
  } else {
    throw new Error('Invalid response');
  }
};

export const createHBJSONLayer = async (position: [number, number, number], hbjsonPath: string) => {
  console.log('Creating layer for:', hbjsonPath);
  //const glbUrl = await fetchAndConvertHBJSON(hbjsonPath);

  /** Give an overwritten placeholder glb url in cachedGLB/demo.glb */
  const glbUrl = 'cachedGLB/demo.glb';

  if (!glbUrl) throw new Error('Conversion failed');

  
  return generateHBJSONScenegraphLayer(position, glbUrl);
};

/**
 * Fetches an HBJSON file and converts it to a GLB Blob URL.
 */
const fetchAndConvertHBJSON = async (url: string): Promise<string | null> => {
  try {
    console.log('Fetching HBJSON from:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch HBJSON');
    const hbjson = await response.json();
    console.log('HBJSON fetched successfully.');
    const glbBuffer = await hbjsonToGLB(hbjson);
    // Create a Blob URL for the GLB buffer
    const glbBlob = new Blob([glbBuffer], { type: 'model/gltf-binary' });
    const glbUrl = URL.createObjectURL(glbBlob);
    return glbUrl;
  } catch (error) {
    console.error('Error fetching or converting HBJSON:', error);
    return null;
  }
};

/**
 * Generates a ScenegraphLayer using the provided GLB URL.
 */
const generateHBJSONScenegraphLayer = async (position: [number, number, number], fileUrl: string) => {
  console.log('Generating ScenegraphLayer for GLB file:', fileUrl);
  const id = 'hbjson-glb-layer';
  const data = [{ position }];
  const layer = new ScenegraphLayer({
    id,
    data,
    scenegraph: fileUrl,
    getPosition: (d: any) => d.position || [11.977832, 57.706608, 0],


    getOrientation: () => [0, 0, 0],
    getScale: () => [1, 1, 1],
    getColor: [255, 255, 255],
    sizeScale: 1,
    parameters: {depthTest: true},
    pickable: true,
    shadowEnabled: false,
    _lighting: 'pbr',
    onError: (error: any) => console.error('Error loading HBJSON:', error)
  });
  console.log('HBJSON Layer created:', layer);
  return layer;
};

export {};