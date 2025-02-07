// filepath: /d:/GitHub/SBE_viewer/gis-viewer-app/src/utils/layersConfig.ts
import { createTreeLayer, createTreePointsLayer } from './layers/treeLayers';
import { createBuildingLayer, createLandCoverLayer } from './layers/buildingLayers';
import { createHBJSONLayer } from './layers/hbjsonLayer';
import { create3DTilesLayer } from './layers/3dTiles';

export const createLayers = async (gisData: any, treeData: any, handleLayerClick: (info: any) => void, colorBy: string) => {
  console.log('Creating layers with colorBy:', colorBy);
  const hbjsonPosition: [number, number, number] = [11.9690435, 57.7068985, 0]; // [lon, lat, alt]
  const layers = [
    await createBuildingLayer(gisData, handleLayerClick, colorBy),
    await createLandCoverLayer(gisData),
    await createTreePointsLayer(treeData),
    await createTreeLayer(treeData), // Ensure the tree layer is awaited
    await createHBJSONLayer(hbjsonPosition),
    await create3DTilesLayer()
  ].filter(layer => layer !== null); // Remove any null layers

  console.log('Layers created:', layers);
  return layers;
};

