import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DeckGL, { DeckGLRef } from '@deck.gl/react';
import { MapView, ViewStateChangeParameters } from '@deck.gl/core';
import LeftDrawer from './LeftDrawer';
import MapComponent, { MapComponentProps } from './MapComponent';
import SunlightSlider from './SunlightSlider';
import { loadGisData, loadTreeData } from '../utils/gisDataLoader';
import RightDrawer from './RightDrawer';
import { Layer } from '@deck.gl/core';
import { generateLighting } from '../utils/lightingEffects';
import { createLayers } from '../utils/layersConfig'; // <-- new import
import { DEFAULT_SUNLIGHT_TIME } from '../utils/constants';

// Define ViewState interface
interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
    maxZoom?: number;
    minZoom?: number;
    maxPitch?: number;
    minPitch?: number;
}

interface LayerWithVisibility extends Layer {
    visible: boolean;
}

// Initial Map State
const INITIAL_VIEW_STATE: ViewState = {
    longitude: 11.9690435, 
    latitude: 57.7068985,
    zoom: 15,
    pitch: 45,
    bearing: 0,
    maxZoom: 20,
    minZoom: 0,
    maxPitch: 60,
    minPitch: 0
};

const MapViewer: React.FC = () => {
    const [gisData, setGisData] = useState<any>(null);
    const [sunlightTime, setSunlightTime] = useState(DEFAULT_SUNLIGHT_TIME);
    const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
    const deckRef = useRef<DeckGLRef>(null);

    // Memoize state values to avoid unnecessary renders
    const [basemapStyle, setBasemapStyle] = useState('mapbox://styles/mapbox/light-v10');
    const [treeData, setTreeData] = useState<any>(null);
    const [showBasemap, setShowBasemap] = useState(true);
    
    const [colorBy, setColorBy] = useState<string>(''); // Set default value to empty string

    const [layerVisibility, setLayerVisibility] = useState<{ [key: string]: boolean }>(() => ({
        buildings: true,
        'land-cover': true,
        'tree-layer': true,
        'tree-points-layer': true,
        'hbjson-glb-layer': true,
        'tile-3d-layer': true
    }));

    const [isDarkMode, setIsDarkMode] = useState(false);
    
    const [layers, setLayers] = useState<any[]>([]);

    const handleBasemapChange = useCallback((style: string) => {
        setBasemapStyle(style);
    }, []);

    // Theme toggle handler
    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => {
            const newTheme = !prev;
            document.documentElement.setAttribute(
                'data-theme',
                newTheme ? 'dark' : 'light'
            );
            handleBasemapChange(
                newTheme ? 
                'mapbox://styles/mapbox/dark-v10' : 
                'mapbox://styles/mapbox/light-v10'
            );
            return newTheme;
        });
    }, [handleBasemapChange]);

    // Initialize theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);

    // Load GIS Data once
    useEffect(() => {
        const fetchData = async () => {
            if (!gisData) {
                const data = await loadGisData();
                setGisData(data);
            }
        };
        fetchData();
    }, [gisData]);

    // Load Tree Data once
    useEffect(() => {
        const fetchTreeData = async () => {
            if (!treeData) {
                const data = await loadTreeData();
                setTreeData(data);
            }
        };
        fetchTreeData();
    }, [treeData]);

    // Handlers: Memoized to prevent unnecessary re-renders
    const handleSliderChange = useCallback((newValue: number) => {
        setSunlightTime(newValue);
    }, []);

    const resetView = useCallback(() => {
        setViewState(INITIAL_VIEW_STATE);
    }, []);

    const onViewStateChange = useCallback((params: ViewStateChangeParameters) => {
        if (params.viewState) {
            setViewState(params.viewState);
        }
    }, []);

    const handleVisibilityToggle = useCallback((layerId: string) => {
        setLayerVisibility(prevState => ({
            ...prevState,
            [layerId]: !prevState[layerId]
        }));
    }, []);

    const toggleBasemap = useCallback(() => {
        setShowBasemap(prevState => !prevState);
    }, []);

    const handleColorByChange = useCallback((colorBy: string) => {
        console.log('Color by changed to:', colorBy); // Add this line
        setColorBy(colorBy); // Update state when colorBy changes
    }, []);

    const handleLayerClick = useCallback((info: any) => {
        // Custom click handler logic
    }, []);
    
    useEffect(() => {
        if (!gisData) return;
        const updateLayers = async () => {
            const resolvedLayers: any[] = await createLayers(gisData, treeData, handleLayerClick, colorBy);
            setLayers(resolvedLayers.filter(layer => layer && layerVisibility[(layer as any).id]));
        };
        updateLayers();
    }, [gisData, treeData, layerVisibility, handleLayerClick, colorBy]);

    // Consolidated tooltip callback
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

    const lightingEffects = useMemo(() => [generateLighting(new Date(sunlightTime))], [sunlightTime]);

    const handleAddLayer = useCallback((newLayer: Layer) => {
        setLayers(prevLayers => [...prevLayers, newLayer]);
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <LeftDrawer 
                resetView={resetView} 
                onBasemapChange={handleBasemapChange} 
                layers={Object.keys(layerVisibility).map(id => ({ id, visible: layerVisibility[id] } as LayerWithVisibility))} 
                onVisibilityToggle={handleVisibilityToggle} 
                onColorByChange={handleColorByChange}
                onAddLayer={handleAddLayer}  // Changed from importDataProps
            />
            <div style={{ flexGrow: 1, position: 'relative' }}>
                <DeckGL
                    ref={deckRef}
                    views={new MapView({ id: 'main', controller: true })}
                    viewState={viewState}
                    onViewStateChange={onViewStateChange}
                    style={{ backgroundColor: 'transparent', height: '100%', width: '100%' }}
                    effects={lightingEffects}
                    layers={layers}
                    getTooltip={getTooltip}
                    useDevicePixels={true}
                    parameters={{ 

                     }}
                    
                >
                    {showBasemap && (
                        <MapComponent 
                            initialViewState={viewState}
                            mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || ''} // Pass the token as a prop
                            sunlightTime={sunlightTime}
                            basemapStyle={basemapStyle}
                            gisData={gisData}
                            treeData={treeData}
                            layerVisibility={layerVisibility}
                            showBasemap={showBasemap}
                            treePointsData={treeData} // Using treeData as treePointsData
                            colorBy={colorBy}
                        />
                    )}
                </DeckGL>
                <SunlightSlider sunlightTime={sunlightTime} onSliderChange={handleSliderChange} />
                <button 
                    className={`toggle-map-btn ${showBasemap ? 'active' : ''}`}
                    onClick={toggleBasemap}
                    title={`${showBasemap ? 'Hide' : 'Show'} basemap`}
                >
                    <i className="fas fa-map"></i>
                </button>
                <button 
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                >
                    <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
                </button>
            </div>
            {gisData && <RightDrawer geojsonData={gisData} />}
        </div>
    );
};

export default MapViewer;
