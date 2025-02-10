// filepath: /d:/GitHub/SBE_viewer/gis-viewer-app/src/utils/gisDataLoader.ts
// GIS data located at filepath: ../../public/sample-data.geojson
const basePath = process.env.REACT_APP_BASE_PATH || '';

export const loadGisData = async () => {
    try {
        const response = await fetch(`${basePath}/sample-data.geojson`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        return null;
    }
};

export const loadTreeData = async () => {
    try {
        const response = await fetch(`${basePath}/trees.geojson`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        //console.log('Loaded tree data:', data); // Add log to verify data
        return data;
    } catch (error) {
        console.error('Error loading tree GeoJSON data:', error);
        return null;
    }
};