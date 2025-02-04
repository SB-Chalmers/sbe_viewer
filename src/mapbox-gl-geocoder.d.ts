// filepath: /d:/GitHub/SBE_viewer/gis-viewer-app/src/mapbox-gl-geocoder.d.ts
declare module '@mapbox/mapbox-gl-geocoder' {
    import { IControl } from 'mapbox-gl';
    
    interface GeocoderOptions {
        accessToken: string;
        mapboxgl: any;
    }

    export default class MapboxGeocoder implements IControl {
        constructor(options: GeocoderOptions);
        onAdd(map: mapboxgl.Map): HTMLElement;
        onRemove(map: mapboxgl.Map): void;
    }
}