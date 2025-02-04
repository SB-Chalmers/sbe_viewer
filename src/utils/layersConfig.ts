// filepath: /d:/GitHub/SBE_viewer/gis-viewer-app/src/utils/layersConfig.ts
import { GeoJsonLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { DateTime } from 'luxon';
import { Feature, Polygon } from 'geojson';
import { getColorFromValue, getColormapForVariable } from './colormapHelpers';
import { GLTFLoader, postProcessGLTF } from '@loaders.gl/gltf';
import { load } from '@loaders.gl/core';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { registerLoaders } from '@loaders.gl/core';
import { CubeGeometry } from '@luma.gl/engine';
import { hbjsonToGLB } from './hbjsonHelpers';

// Register the GLTF loader
registerLoaders([GLTFLoader]);

const generateBoundingBox = (data: any): Feature<Polygon> => {
  const coordinates = data.features.flatMap((feature: any) => feature.geometry.coordinates.flat());
  const lats = coordinates.map((coord: any) => coord[1]);
  const lngs = coordinates.map((coord: any) => coord[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat]
        ]
      ]
    },
    properties: {
      isFloor: true,
      footprint_extrusion: 0
    }
  };
};

const createTreeLayer = async (data: any, id: string = 'tree-layer') => {
  console.log('Creating Tree Layer with data:', data);

  if (!data || !Array.isArray(data.features)) {
      console.error('Tree layer data is missing or not an array:', data);
      return null; // Prevents layer creation if data is invalid
  }

  const scenegraph = 'tree.glb'; // Ensure the correct path

  const layer = new ScenegraphLayer({
      id,
      data: data.features, // Ensure it's passing an array of features
      scenegraph,

      // Set position using geo-coordinates
      getPosition: (d: any) => d.geometry?.coordinates || [0, 0, 0],

      // Fix tree angles by ensuring upright orientation
      getOrientation: (d: any) => {
          return [0, Math.random() * 10 - 5, 90]; // Slight rotation only on Y-axis
      },

      // Apply natural size variation
      getScale: (d: any) => {
          const randomScale = 0.8 + Math.random() * 0.3; // Scale between 0.9 and 1.2
          return [randomScale, randomScale, randomScale]; 
      },

      sizeScale: 1, // Base scale multiplier

      // Enable picking interactions
      pickable: false,
      getColor: [150, 200, 150, 255], // Default color

      // Use realistic PBR lighting
      _lighting: 'pbr',

      onError: (error: any) => {
          console.error('Error loading ScenegraphLayer:', error);
      }
  });

  console.log('Tree Layer created:', layer);
  return layer;
};

const createTreePointsLayer = (data: any, id: string = 'tree-points-layer') => {
    return new GeoJsonLayer({
        id,
        data,
        pointRadiusMinPixels: 2,
        getPointRadius: 4,
        getFillColor: [0, 200, 0],
        pickable: false,
        getLineWidth: 1,

    });
};

const createBuildingLayer = (
  gisData: any,
  handleLayerClick: (info: any) => void,
  timeOfDay: string,
  colorBy: string
) => {
  console.log('Creating Building Layer with colorBy:', colorBy);

  // Compute min and max for numerical attributes
  const min = Math.min(...gisData.features.map((f: any) => f.properties[colorBy] || 0));
  const max = Math.max(...gisData.features.map((f: any) => f.properties[colorBy] || 0));

  return new GeoJsonLayer({
    id: "buildings",
    data: gisData,
    extruded: true,
    wireframe: true,
    opacity: 1,
    getElevation: (f: any) => f.properties.height || 0,
    getFillColor: (d: any) => {
      if (d.properties.isFloor) return [0, 0, 0, 0];
      const value = d.properties[colorBy];
      if (value == null || colorBy === '') return [255, 255, 255, 255]; // Default gray color for missing values

      const isCategorical = typeof value === "string";
      return getColorFromValue(value, colorBy, isCategorical, min, max);
    },
    material: {
      ambient: 0.3,
      diffuse: 0.2,
      shininess: 10,
      specularColor: [150, 180, 180]
    },
    _shadows: true,
    pickable: true,
    onClick: handleLayerClick,
    updateTriggers: {
      getFillColor: colorBy,
      getElevation: 'height' // Ensure elevation updates correctly
    }
  });
};

const createLandCoverLayer = (gisData: any) => {
  const landCover = generateBoundingBox(gisData);
  return new GeoJsonLayer({
    id: "land-cover",
    data: landCover,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [0, 0, 0, 0],
    pickable: false
  });
};

/**
 * Adds an HBJSON-based GLB layer to the map.
 * @param position - [latitude, longitude] coordinates for placement.
 * @returns A ScenegraphLayer for Deck.gl.
 */
  const createHBJSONLayer = async (position: [number, number,number]) => {
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

      // Ensure Deck.gl receives [longitude, latitude] format
      getPosition: (d: any) => d.position || [11.9690435, 57.7068985, 0],

      // Keep orientation fixed
      getOrientation: (d: any) => [0, 0, 0],

      // Keep scale fixed
      getScale: (d: any) => [1, 1, 1],

      sizeScale: 10, // Base scaling factor

      // Enable picking interactions
      pickable: true,

      // Default color for visibility
      getColor: [255, 255, 255, 255],
      
      // Use PBR lighting model for better rendering
      _lighting: 'pbr',

      onError: (error: any) => {
          console.error('Error loading HBJSON:', error);
      }
  });

  console.log('HBJSON Layer created:', layer);
  return layer;
};


export const createLayers = async (gisData: any, treeData: any, handleLayerClick: (info: any) => void, sunlightTime: number, colorBy: string) => {
  console.log('Creating layers with colorBy:', colorBy);
  const date = DateTime.fromMillis(sunlightTime).setZone('Europe/Stockholm');
  const sunrise = date.startOf('day').plus({ hours: 6 });
  const sunset = date.startOf('day').plus({ hours: 18 });
  const timeOfDay = date > sunrise && date < sunset ? "day" : "night";

  const hbjsonPosition: [number, number, number] = [11.9690435, 57.7068985, 0]; // [lon, lat, alt]
  const layers = [
    await createBuildingLayer(gisData, handleLayerClick, timeOfDay, colorBy),
    await createLandCoverLayer(gisData),
    await createTreePointsLayer(treeData),
    await createTreeLayer(treeData), // Ensure the tree layer is awaited
    await createHBJSONLayer(hbjsonPosition),
  ].filter(layer => layer !== null); // Remove any null layers

  console.log('Layers created:', layers);
  return layers;
};


export { createTreeLayer, createTreePointsLayer, createBuildingLayer, createLandCoverLayer, createHBJSONLayer };

