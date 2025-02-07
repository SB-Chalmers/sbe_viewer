import { Tile3DLayer } from '@deck.gl/geo-layers';
import { _SunLight } from '@deck.gl/core';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY as string;
const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

export const create3DTilesLayer = () => {
    return new Tile3DLayer({
        id: 'google-3d-tiles',
        data: TILESET_URL,
        loadOptions: {
            fetch: {
                headers: {
                    'X-GOOG-API-KEY': GOOGLE_API_KEY
                }
            }
        },
        onTilesetLoad: (tileset3d: any) => {
            tileset3d.options.onTraversalComplete = (selectedTiles: any) => {
                const credits = new Set();
                selectedTiles.forEach((tile: any) => {
                    const { copyright } = tile.content.gltf.asset;
                    copyright.split(';').forEach(credits.add, credits);
                });
                return selectedTiles;
            };
        }
    });
};
