import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DeckGL from '@deck.gl/react';
import { createLayers } from '../utils/layersConfig';
import { lightingEffect, sun, generateLighting } from '../utils/lightingEffects';
import './PopupComponent.css';
import Stats from 'stats.js';

export interface MapComponentProps {
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
    colorBy: string;
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
    colorBy
}) => {
    const mapRef = useRef<any>(null);
    const stats = useRef<Stats | null>(null);

    // Memoize lighting effects to prevent re-rendering
    const [effects, setEffects] = useState([lightingEffect]);

    // Update light effect when sunlightTime changes
    useEffect(() => {
        if (sunlightTime) {
            sun.timestamp = sunlightTime;
            setEffects([generateLighting(new Date(sunlightTime))]);
        }
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

    // Memoize handleLayerClick
    const handleLayerClick = useCallback((info: any) => {
        // Custom click handler logic
    }, []); // Empty dependency array since it doesn't depend on any props

    // Add state for layers
    const [currentLayers, setCurrentLayers] = useState<any[]>([]);

    // Replace the layers useMemo with useEffect
    useEffect(() => {
        const updateLayers = async () => {
            if (!gisData) {
                setCurrentLayers([]);
                return;
            }
            
            try {
                const newLayers = await createLayers(gisData, treeData, handleLayerClick, colorBy);
                const filteredLayers = (Array.isArray(newLayers) ? newLayers : [])
                    .filter(layer => layer && layerVisibility[(layer as any).id]);
                setCurrentLayers(filteredLayers);
            } catch (error) {
                console.error('Error creating layers:', error);
                setCurrentLayers([]);
            }
        };

        updateLayers();
    }, [gisData, treeData, layerVisibility, colorBy, handleLayerClick]);

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
                layers={currentLayers}
                effects={effects} // Ensure this is updated
                getTooltip={getTooltip}
                useDevicePixels={true}
                parameters={{ 
                        
                }}
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
        </div>
    );
};

export default MapComponent;
