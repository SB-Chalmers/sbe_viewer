import { Tile3DLayer } from '@deck.gl/geo-layers';
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY as string;
console.log('Google API key:', GOOGLE_API_KEY);

const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

export const create3DTilesLayer = (): Tile3DLayer | null => {
    console.log('Creating 3D Tiles layer...');
    try {
        console.log('Initializing Tile3DLayer with URL:', TILESET_URL);
        return new Tile3DLayer({
            id: 'tile-3d-layer',
            data: TILESET_URL,
            _shadow: false,
            shadowEnabled: false,
            loadOptions: {
                fetch: {
                    headers: {
                        'X-GOOG-API-KEY': GOOGLE_API_KEY
                    }
                }
            },

        });
    } catch (error) {
        console.error('Error creating 3D Tiles layer:', error);
        return null;
    }
};