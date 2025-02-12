import { GeoJsonLayer } from '@deck.gl/layers';
import { Feature, Polygon } from 'geojson';
import { getColorFromValue } from '../colormapHelpers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

const extractCoordinates = (obj: any): number[][] => {
  if (Array.isArray(obj)) {
    // Check if this array represents a coordinate pair [lng, lat]
    if (obj.length === 2 && typeof obj[0] === 'number' && typeof obj[1] === 'number') {
      return [obj];
    }
    // Recursively process array elements
    return obj.flatMap(item => extractCoordinates(item));
  }
  
  if (obj && typeof obj === 'object') {
    // If this is a GeoJSON object, focus on the coordinates property
    if (obj.type && obj.coordinates) {
      return extractCoordinates(obj.coordinates);
    }
    // For features array or other objects, process all values
    return Object.values(obj).flatMap(value => extractCoordinates(value));
  }
  
  return [];
};

const generateBoundingBox = (data: any): Feature<Polygon> => {

  const emptyBoundingBox: Feature<Polygon> = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
      ]]
    },
    properties: {
      isFloor: true,
      footprint_extrusion: 0,
      isError: true // Add flag to indicate this is an error case
    }
  };


  if (!data) {
    console.error('No data provided');
    return emptyBoundingBox;
  }

  // Extract all coordinates from the data structure
  const coordinates = extractCoordinates(data);
  
  if (coordinates.length === 0) {
    console.error('No valid coordinates found in data');
    return emptyBoundingBox;
  }

  // Calculate bounds
  const lngs = coordinates.map(coord => coord[0]);
  const lats = coordinates.map(coord => coord[1]);
  
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  console.log('Bounding box coordinates:', { minLng, maxLng, minLat, maxLat });

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat]
      ]]
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
    wireframe: false,
    opacity: 1,
    getElevation: (f: any) => f.properties.height || 0,
    getFillColor: (d: any) => {
      if (d.properties.isFloor) return [0, 0, 0, 0];
      const value = d.properties[colorBy];
      if (value == null || colorBy === '') return [255, 255, 255, 255]; // Default gray color for missing values

      const isCategorical = typeof value === "string";
      return getColorFromValue(value, colorBy, isCategorical, min, max);
    },
    _shadows: false,
    shadowEnabled: false,
    autoHighlight: true,
    highlightColor: [191, 0, 115, 100],
    pickable: true,
    extensions: [new TerrainExtension()],
    //parameters: { depthTest: true },
    onClick: handleLayerClick,
    updateTriggers: {
      getFillColor: colorBy,
      getElevation: 'height' // Ensure elevation updates correctly
    }
  });
};

export const createLandCoverLayer = (gisData: any) => {
  const landCover = generateBoundingBox(gisData);
  console.log('Creating Land Cover Layer with data:', landCover);
  return new GeoJsonLayer({
    id: "land-cover",
    data: landCover,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [0, 0, 0, 0],
    _shadows: false,
    // extensions: [new TerrainExtension()],
    shadowEnabled: true,
    pickable: false
  });
};

export {};