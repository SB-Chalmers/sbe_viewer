import { Tile3DLayer } from '@deck.gl/geo-layers';
import { generateBoundingBox } from '../layers/buildingLayers';
import { GeoJsonLayer } from '@deck.gl/layers';
import {MaskExtension} from '@deck.gl/extensions';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
// console.log('Google API key:', GOOGLE_API_KEY);

const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

export const createMaskLayer = (gisData: any) => {
  const data = generateBoundingBox(gisData);
  return new GeoJsonLayer({
    id: 'geofence',
    data: data,
    operation: 'mask',
    stroked: false,
    filled: false,
    _shadows: false,
    shadowEnabled: false,
    pickable: false
  });
};

export const create3DTilesLayer = async (): Promise<Tile3DLayer | null> => {
  console.log('Creating 3D Tiles layer...');
  try {
    return new Tile3DLayer({
      id: 'tile-3d-layer',
      data: TILESET_URL,
      _shadow: false,
      shadowEnabled: false,
      opacity: 1,
      //operation: 'terrain+draw',
      extensions: [new MaskExtension()],
      maskId: 'geofence',
      loadOptions: {fetch: {headers: {'X-GOOG-API-KEY': GOOGLE_API_KEY}}}
    });
  } catch (error) {
    console.error('Error creating 3D Tiles layer:', error);
    return null;
  }
};

export{}