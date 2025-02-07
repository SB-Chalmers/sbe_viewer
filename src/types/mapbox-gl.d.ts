declare module 'mapbox-gl' {
    export interface FlyToOptions {
        center?: [number, number];
        zoom?: number;
        bearing?: number;
        pitch?: number;
        duration?: number;
    }
}
