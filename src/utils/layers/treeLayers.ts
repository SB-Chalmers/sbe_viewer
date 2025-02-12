import { GeoJsonLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { getColorFromValue } from '../colormapHelpers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
const basePath = process.env.REACT_APP_BASE_PATH || '';
export const createTreeLayer = async (data: any, id: string = 'tree-layer') => {
  console.log('Creating Tree Layer with data:', data);

  if (!data || !Array.isArray(data.features)) {
      console.error('Tree layer data is missing or not an array:', data);
      return null; // Prevents layer creation if data is invalid
  }

  const scenegraph = `${basePath}tree.glb`; // Ensure the correct path

  // Precompute random scales and orientations
  const features = data.features.map((feature: any) => ({
    ...feature,
    scale: 0.8 + Math.random() * 0.3, // Scale between 0.8 and 1.1
    orientation: [0, Math.random() * 10 - 5, 90] // Slight rotation only on Y-axis
  }));

  const layer = new ScenegraphLayer({
      id,
      data: features, // Use precomputed features
      scenegraph,

      // Set position using geo-coordinates
      getPosition: (d: any) => d.geometry?.coordinates || [0, 0, 0],

      // Use precomputed orientation
      getOrientation: (d: any) => d.orientation,

      // Use precomputed scale
      getScale: (d: any) => [d.scale, d.scale, d.scale],

      sizeScale: 1, // Base scale multiplier

      // Enable picking interactions
      pickable: false,

      // Use realistic PBR lighting
      _lighting: 'pbr',
      //extensions: [new TerrainExtension()],
      _shadow: false,
      shadowEnabled: false,
      animation: false,

      onError: (error: any) => {
          console.error('Error loading ScenegraphLayer:', error);
      }
  });

  console.log('Tree Layer created:', layer);
  return layer;
};

export const createTreePointsLayer = (data: any, id: string = 'tree-points-layer') => {
    return new GeoJsonLayer({
        id,
        data,
        pointRadiusMinPixels: 2,
        getPointRadius: 4,
        getFillColor: [0, 200, 0, 200],
        shadowEnabled: false,
        _shadows: false,
        pickable: false,
        getLineWidth: 1,
    });
};

export {}