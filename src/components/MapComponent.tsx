import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Map, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DeckGL from '@deck.gl/react';
import { createLayers } from '../utils/layersConfig';
import { lightingEffect, dirLight } from '../utils/lightingEffects';
import './PopupComponent.css';
import SunlightSlider from './SunlightSlider';
import Stats from 'stats.js';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN as string;

interface MapComponentProps {
    initialViewState: {
        longitude: number;
        latitude: number;
        zoom: number;
        pitch: number;
        bearing: number;
    };
    mapboxAccessToken: string;
    sunlightTime: number;
    basemapStyle: string;
    gisData: any;
    treeData: any;
    layerVisibility: { [key: string]: boolean };
    showBasemap: boolean;
    treePointsData: any;
    colorBy: string; // Add this line
}

const MapComponent: React.FC<MapComponentProps> = ({ 
    initialViewState,
    mapboxAccessToken,
    sunlightTime,
    basemapStyle,
    gisData,
    treeData,
    layerVisibility,
    showBasemap,
    treePointsData,
    colorBy // Add this line
}) => {
    const mapRef = useRef<any>(null);
    const stats = useRef<Stats | null>(null);
    const [layers, setLayers] = useState<any[]>([]);

    // Memoize lighting effects to prevent re-rendering
    const effects = useMemo(() => [lightingEffect], []);

    // Update light effect when sunlightTime changes
    useEffect(() => {
        dirLight.timestamp = sunlightTime;
    }, [sunlightTime]);

    // Set up FPS monitoring in development mode
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            stats.current = new Stats();
            stats.current.showPanel(0);
            stats.current.dom.style.position = 'fixed';
            stats.current.dom.style.top = '0px';
            stats.current.dom.style.left = '50%';
            stats.current.dom.style.transform = 'translateX(-50%)';
            stats.current.dom.style.zIndex = '100000';
            document.body.appendChild(stats.current.dom);

            const animate = () => {
                stats.current?.begin();
                stats.current?.end();
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        }
    }, []);

    // Handle layer clicks
    const handleLayerClick = useCallback((info: any) => {
        // Custom click handler logic
    }, []);

    // Update layers when gisData, treeData, or other dependencies change
    useEffect(() => {
        if (!gisData) return;

        const updateLayers = async () => {
            console.log('Updating layers with colorBy:', colorBy);
            const resolvedLayers: any[] = await createLayers(gisData, treeData, handleLayerClick, sunlightTime, colorBy);
            console.log('Resolved layers:', resolvedLayers);
            setLayers(resolvedLayers.filter(layer => layer && layerVisibility[(layer as any).id]));
        };

        updateLayers();
    }, [gisData, treeData, sunlightTime, layerVisibility, handleLayerClick, colorBy]);

    // Memoize tooltip function to prevent re-renders
    const getTooltip = useCallback((info: { object?: any }) => {
        if (!info.object) return null;
        const properties = info.object.properties || {};
        return {
            text: [
                `Name: ${properties.name || 'N/A'}`,
                `Type: ${properties.type || 'N/A'}`,
                `Height: ${properties.height || 'N/A'} m`,
                `Function: ${properties.function || 'N/A'}`,
                `Floors: ${properties.floors || 'N/A'}`,
            ].join('\n')
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <DeckGL
                initialViewState={initialViewState}
                controller={true}
                layers={layers} // ✅ Now stored in state
                effects={effects} // ✅ Now memoized
                getTooltip={getTooltip} // ✅ Now memoized
                useDevicePixels={true}
            >
                {showBasemap && (
                    <Map
                        initialViewState={initialViewState}
                        mapboxAccessToken={mapboxAccessToken}
                        mapStyle={basemapStyle}
                        reuseMaps
                    />
                )}
            </DeckGL>
            <SunlightSlider sunlightTime={sunlightTime} onSliderChange={() => {}} />
        </div>
    );
};

export default MapComponent;
