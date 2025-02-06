import { GeoJsonLayer } from '@deck.gl/layers';
import { Feature, Polygon } from 'geojson';
import { getColorFromValue } from '../colormapHelpers';

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

export const createBuildingLayer = (
  gisData: any,
  handleLayerClick: (info: any) => void,
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

export const createLandCoverLayer = (gisData: any) => {
  const landCover = generateBoundingBox(gisData);
  return new GeoJsonLayer({
    id: "land-cover",
    data: landCover,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [0, 0, 0, 0],
    pickable: false
  });
};

export{}