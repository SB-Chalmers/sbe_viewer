import { Tile3DLayer } from '@deck.gl/geo-layers';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY as string;
const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

export const create3DTilesLayer = (): Tile3DLayer | null => {
    console.log('Creating 3D Tiles layer...');
    try {
        console.log('Initializing Tile3DLayer with URL:', TILESET_URL);
        return new Tile3DLayer({
            id: 'tile-3d-layer',
            data: TILESET_URL,
            loadOptions: {
                fetch: {
                    headers: {
                        'X-GOOG-API-KEY': GOOGLE_API_KEY
                    }
                }
            },
            onTilesetLoad: (tileset3d) => {
                console.log('Tileset loaded:', tileset3d);
                tileset3d.options.onTraversalComplete = (selectedTiles) => {
                    console.log('Traversal complete. Selected tiles:', selectedTiles);
                    const credits = new Set<string>();
                    selectedTiles.forEach((tile) => {
                        const { copyright } = tile.content.gltf.asset;
                        console.log('Processing tile:', tile);
                        copyright.split(';').forEach(credits.add, credits);
                    });
                    console.log('Credits:', credits);
                    return selectedTiles;
                };
            }
        });
    } catch (error) {
        console.error('Error creating 3D Tiles layer:', error);
        return null;
    }
};