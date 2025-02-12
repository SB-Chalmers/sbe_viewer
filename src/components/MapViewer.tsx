import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import DeckGL, { DeckGLRef } from '@deck.gl/react';
import { MapView, ViewStateChangeParameters } from '@deck.gl/core';
import SunlightSlider from './SunlightSlider';
import { loadGisData, loadTreeData } from '../utils/gisDataLoader';
import { Layer } from '@deck.gl/core';
import { DEFAULT_SUNLIGHT_TIME } from '../utils/constants';
import debounce from 'lodash.debounce';
import { getTooltip, getLightingEffects, updateLayers, handleLayerClick, toggleBasemap, toggleTheme } from '../utils/mapUtils';


const LeftDrawer = lazy(() => import('./LeftDrawer'));
const RightDrawer = lazy(() => import('./RightDrawer'));
const MapComponent = lazy(() => import('./MapComponent'));

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

const INITIAL_VIEW_STATE: ViewState = {
    longitude: 11.906021781151582,
    latitude: 57.71879724881195,
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

    const [basemapStyle, setBasemapStyle] = useState('mapbox://styles/mapbox/light-v10');
    const [treeData, setTreeData] = useState<any>(null);
    const [showBasemap, setShowBasemap] = useState(true);
    const [colorBy, setColorBy] = useState<string>('');
    const [layerVisibility, setLayerVisibility] = useState<{ [key: string]: boolean }>(() => ({
        buildings: true,
        'land-cover': true,
        'tree-layer': true,
        'tree-points-layer': true,
        'hbjson-glb-layer': false,
        'tile-3d-layer': false
    }));
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [layers, setLayers] = useState<any[]>([]);
    const [initialLoad, setInitialLoad] = useState(true);

    const handleBasemapChange = useCallback((style: string) => {
        setBasemapStyle(style);
    }, []);

    const handleToggleTheme = useCallback(() => {
        toggleTheme(setIsDarkMode, handleBasemapChange);
    }, [handleBasemapChange]);

    const handleToggleBasemap = useCallback(() => {
        toggleBasemap(setShowBasemap);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gisData, treeData] = await Promise.all([loadGisData(), loadTreeData()]);
                setGisData(gisData);
                setTreeData(treeData);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (initialLoad) {
            setViewState(INITIAL_VIEW_STATE);
            setInitialLoad(false);
        }
    }, [initialLoad]);

    const handleSliderChange = useCallback((newValue: number) => {
        setSunlightTime(newValue);
    }, []);

    const resetView = useCallback(() => {
        setViewState(INITIAL_VIEW_STATE);
    }, []);

    const onViewStateChange = useCallback(debounce((params: ViewStateChangeParameters) => {
        if (params.viewState) {
            setViewState(params.viewState);
        }
    }, 300), []);

    const handleVisibilityToggle = useCallback((layerId: string) => {
        setLayerVisibility(prevState => ({
            ...prevState,
            [layerId]: !prevState[layerId]
        }));
    }, []);

    const handleColorByChange = useCallback((colorBy: string) => {
        console.log('Color by changed to:', colorBy);
        setColorBy(colorBy);
    }, []);

    useEffect(() => {
        if (!gisData) return;
        const updateLayersAsync = async () => {
            const layers = await updateLayers(gisData, treeData, handleLayerClick, colorBy, layerVisibility);
            setLayers(layers);
        };
        updateLayersAsync();
    }, [gisData, treeData, layerVisibility, handleLayerClick, colorBy]);

    const lightingEffects = useMemo(() => getLightingEffects(sunlightTime), [sunlightTime]);

    const handleAddLayer = useCallback((newLayer: Layer) => {
        setLayers(prevLayers => [...prevLayers, newLayer]);
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Suspense fallback={<div>Loading...</div>}>
                <LeftDrawer 
                    resetView={resetView} 
                    onBasemapChange={handleBasemapChange} 
                    layers={Object.keys(layerVisibility).map(id => ({ id, visible: layerVisibility[id] } as LayerWithVisibility))} 
                    onVisibilityToggle={handleVisibilityToggle} 
                    onColorByChange={handleColorByChange}
                    onAddLayer={handleAddLayer}
                />
            </Suspense>
            <div style={{ flexGrow: 1, position: 'relative' }}>
                <DeckGL
                    ref={deckRef}
                    views={new MapView({ id: 'main', controller: true })}
                    controller={{touchRotate: true, inertia: 250}}
                    viewState={viewState}
                    onViewStateChange={onViewStateChange}
                    style={{ backgroundColor: 'transparent', height: '100%', width: '100%' }}
                    effects={lightingEffects}
                    layers={layers}
                    getTooltip={getTooltip}
                    useDevicePixels={true}
                >
                    {showBasemap && (
                        <Suspense fallback={<div>Loading...</div>}>
                            <MapComponent 
                                initialViewState={INITIAL_VIEW_STATE}
                                mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || ''} 
                                sunlightTime={sunlightTime}
                                basemapStyle={basemapStyle}
                                gisData={gisData}
                                treeData={treeData}
                                layerVisibility={layerVisibility}
                                showBasemap={showBasemap}
                                treePointsData={treeData}
                                colorBy={colorBy}
                            />
                        </Suspense>
                    )}
                </DeckGL>
                <SunlightSlider sunlightTime={sunlightTime} onSliderChange={handleSliderChange} />
                <button 
                    className={`toggle-map-btn ${showBasemap ? 'active' : ''}`}
                    onClick={handleToggleBasemap}
                    title={`${showBasemap ? 'Hide' : 'Show'} basemap`}
                >
                    <i className="fas fa-map"></i>
                </button>
                <button 
                    className="theme-toggle-btn"
                    onClick={handleToggleTheme}
                    title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                >
                    <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
                </button>
            </div>
            {gisData && (
                <Suspense fallback={<div>Loading...</div>}>
                    <RightDrawer geojsonData={gisData} />
                </Suspense>
            )}
        </div>
    );
};

export default MapViewer;