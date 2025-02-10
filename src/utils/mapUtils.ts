import { Layer } from '@deck.gl/core';
import { generateLighting } from './lightingEffects';
import { createLayers } from './layersConfig';

// Function to get tooltip
export const getTooltip = (info: { object?: any }) => {
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
};

// Function to generate lighting effects
export const getLightingEffects = (sunlightTime: number) => {
    return [generateLighting(new Date(sunlightTime))];
};

// Function to update layers
export const updateLayers = async (
    gisData: any,
    treeData: any,
    handleLayerClick: (info: any) => void,
    colorBy: string,
    layerVisibility: { [key: string]: boolean }
) => {
    const resolvedLayers: any[] = await createLayers(gisData, treeData, handleLayerClick, colorBy);
    return resolvedLayers.filter(layer => layer && layerVisibility[(layer as any).id]);
};

// Function to handle layer click
export const handleLayerClick = (info: any) => {
    // Custom click handler logic
};

// Function to toggle basemap
export const toggleBasemap = (setShowBasemap: React.Dispatch<React.SetStateAction<boolean>>) => {
    setShowBasemap(prevState => !prevState);
};

// Function to toggle theme
export const toggleTheme = (
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>,
    handleBasemapChange: (style: string) => void
) => {
    setIsDarkMode(prev => {
        const newTheme = !prev;
        document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
        handleBasemapChange(newTheme ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10');
        return newTheme;
    });
};

export {}