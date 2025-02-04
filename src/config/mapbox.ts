const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
//console.log('Mapbox Token:', process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);

if (!mapboxToken) {
    console.error('Error: Mapbox Access Token is missing. Please define REACT_APP_MAPBOX_ACCESS_TOKEN in your .env file.');
    // Optional: You can throw an error if you want the app to stop
    // throw new Error('Mapbox Access Token is missing. Please set REACT_APP_MAPBOX_ACCESS_TOKEN in your environment variables.');
}

export const MapboxAccessToken: string = mapboxToken || '';
