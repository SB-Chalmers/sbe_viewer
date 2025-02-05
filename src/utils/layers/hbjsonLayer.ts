import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { hbjsonToGLB } from '../hbjsonHelpers';

export const createHBJSONLayer = async (position: [number, number, number]) => {
  console.log('Creating HBJSON Layer with position:', position);
  const existingFilePath = 'uploads/demo.glb'; // change to uploads/demo.glb after testing
  const remoteHBJSONUrl = 'https://raw.githubusercontent.com/ladybug-tools/honeybee-schema/refs/heads/master/samples/model_large/lab_building.hbjson';
  const saveGLBUrl = 'http://localhost:3001/api/save-glb';

  try {
      // Check if the GLB file already exists on the server
      const fileExistsResponse = await fetch(existingFilePath, { method: 'HEAD' });

      if (fileExistsResponse.ok) {
          console.log('GLB file found on the server.');
          return generateHBJSONScenegraphLayer(position, existingFilePath);
      }

      console.log('GLB file not found. Fetching and converting HBJSON...');

      // Fetch and convert HBJSON to GLB
      const glbBuffer = await fetchAndConvertHBJSON(remoteHBJSONUrl);
      if (!glbBuffer) throw new Error('Failed to convert HBJSON to GLB');

      // Save GLB to the server
      const savedFilePath = await saveGLBToServer(glbBuffer, saveGLBUrl);
      if (!savedFilePath) throw new Error('Failed to save GLB on the server');

      console.log('GLB file saved. Creating HBJSON ScenegraphLayer...');
      return generateHBJSONScenegraphLayer(position, savedFilePath);

  } catch (error) {
      console.error('Failed to create HBJSON layer:', error);
      return null;
  }
};

/**
* Fetches an HBJSON file and converts it to a GLB buffer.
*/
const fetchAndConvertHBJSON = async (url: string): Promise<ArrayBuffer | null> => {
  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch HBJSON');

      const hbjson = await response.json();
      console.log('HBJSON fetched successfully.');

      return await hbjsonToGLB(hbjson);
  } catch (error) {
      console.error('Error fetching or converting HBJSON:', error);
      return null;
  }
};

/**
* Saves a GLB buffer to the server.
*/
const saveGLBToServer = async (glbBuffer: ArrayBuffer, url: string): Promise<string | null> => {
  try {
      const saveResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: glbBuffer
      });

      if (!saveResponse.ok) throw new Error('Failed to save GLB');

      const { filePath } = await saveResponse.json();
      return filePath;
  } catch (error) {
      console.error('Error saving GLB:', error);
      return null;
  }
};

/**
* Generates a ScenegraphLayer using a specified GLB file.
*/
const generateHBJSONScenegraphLayer = async (position: [number, number, number], filePath: string) => {
  const id: string = 'hbjson-glb-layer';
  const data: any = [{ position }]; // Ensure data follows the expected format
  const scenegraph : string = filePath; // can change to filePath after testing

  const layer = new ScenegraphLayer({
      id,
      data,
      scenegraph,
      getPosition: (d: any) => d.position || [11.9690435, 57.7068985, 0],
      getOrientation: (d: any) => [0, 0, 0],
      getScale: (d: any) => [1, 1, 1],
      getColor: [255, 255, 255],
      sizeScale: 1,
      pickable: true,
      _lighting: 'pbr',
      onError: (error: any) => {
          console.error('Error loading HBJSON:', error);
      }
  });
  console.log('HBJSON Layer created:', layer);
  return layer;
};

export{}