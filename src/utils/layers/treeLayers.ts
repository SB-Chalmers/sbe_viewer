import { GeoJsonLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';

export const createTreeLayer = async (data: any, id: string = 'tree-layer') => {
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

export const createTreePointsLayer = (data: any, id: string = 'tree-points-layer') => {
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

export{}