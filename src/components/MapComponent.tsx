import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DeckGL from '@deck.gl/react';
import { getTooltip, getLightingEffects, updateLayers, handleLayerClick } from '../utils/mapUtils';
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
    const [effects, setEffects] = useState(getLightingEffects(sunlightTime));

    // Update light effect when sunlightTime changes
    useEffect(() => {
        if (sunlightTime) {
            setEffects(getLightingEffects(sunlightTime));
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

    // Add state for layers
    const [currentLayers, setCurrentLayers] = useState<any[]>([]);

    // Replace the layers useMemo with useEffect
    useEffect(() => {
        const updateLayersAsync = async () => {
            if (!gisData) {
                setCurrentLayers([]);
                return;
            }
            try {
                const layers = await updateLayers(gisData, treeData, handleLayerClick, colorBy, layerVisibility);
                setCurrentLayers(layers);
            } catch (error) {
                console.error('Error creating layers:', error);
                setCurrentLayers([]);
            }
        };
        updateLayersAsync();
    }, [gisData, treeData, layerVisibility, colorBy, handleLayerClick]);

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
