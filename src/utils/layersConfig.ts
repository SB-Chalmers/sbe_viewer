// filepath: /d:/GitHub/SBE_viewer/gis-viewer-app/src/utils/layersConfig.ts
import { createTreeLayer, createTreePointsLayer } from './layers/treeLayers';
import { createBuildingLayer, createLandCoverLayer } from './layers/buildingLayers';
import { createHBJSONLayer } from './layers/hbjsonLayer';
import { create3DTilesLayer } from './layers/3dTiles';

const basePath = process.env.REACT_APP_BASE_PATH || '';

export const createLayers = async (gisData: any, treeData: any, handleLayerClick: (info: any) => void, colorBy: string) => {
  console.log('Creating layers with colorBy:', colorBy);
  const hbjsonPosition: [number, number, number] = [11.979, 57.707, 0]; // [lon, lat, alt]

  // Load layers asynchronously
  const buildingLayerPromise = createBuildingLayer(gisData, handleLayerClick, colorBy);
  const landCoverLayerPromise = createLandCoverLayer(gisData);
  const treePointsLayerPromise = createTreePointsLayer(treeData);
  const treeLayerPromise = createTreeLayer(treeData);
  const hbjsonLayerPromise = createHBJSONLayer(hbjsonPosition, `${basePath}demo.hbjson`);
  const tile3dLayerPromise = create3DTilesLayer();

  // Await all promises
  const layers = await Promise.all([
    tile3dLayerPromise,
    hbjsonLayerPromise,
    treeLayerPromise,
    buildingLayerPromise,
    treePointsLayerPromise,
    landCoverLayerPromise,
  ]);

  // Filter out any null layers
  const validLayers = layers.filter(layer => layer !== null);

  console.log('Layers created:', validLayers);
  return validLayers;
};