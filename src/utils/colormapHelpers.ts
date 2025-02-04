import {
    interpolateViridis,
    interpolatePlasma,
    interpolateInferno,
    interpolateMagma,
    interpolateCividis,
    interpolateTurbo,
    interpolateBlues,
    interpolateGreens,
    interpolateGreys,
    interpolateOranges,
    interpolatePurples,
    interpolateReds,
    interpolateRainbow,
    interpolateSinebow,
    schemeCategory10,
    schemeAccent,
    schemeDark2,
    schemePaired,
    schemePastel1,
    schemePastel2,
    schemeSet1,
    schemeSet2,
    schemeSet3,
    schemeTableau10
} from 'd3-scale-chromatic';

// Define sequential colormaps
const colormaps: Record<string, (t: number) => string> = {
    viridis: interpolateViridis,
    plasma: interpolatePlasma,
    inferno: interpolateInferno,
    magma: interpolateMagma,
    cividis: interpolateCividis,
    turbo: interpolateTurbo,
    blues: interpolateBlues,
    greens: interpolateGreens,
    greys: interpolateGreys,
    oranges: interpolateOranges,
    purples: interpolatePurples,
    reds: interpolateReds,
    rainbow: interpolateRainbow,
    sinebow: interpolateSinebow
};

// Define categorical colormaps
const categoricalColormaps: Record<string, string[]> = {
    category10: schemeCategory10,
    accent: schemeAccent,
    dark2: schemeDark2,
    paired: schemePaired,
    pastel1: schemePastel1,
    pastel2: schemePastel2,
    set1: schemeSet1,
    set2: schemeSet2,
    set3: schemeSet3,
    tableau10: schemeTableau10
};

const EPC_COLORS: Record<string, string> = {
    A: '#00FF00', // Green
    B: '#7FFF00', // Chartreuse
    C: '#FFFF00', // Yellow
    D: '#FFD700', // Gold
    E: '#FFA500', // Orange
    F: '#FF4500', // OrangeRed
    G: '#FF0000'  // Red
};

const variableColormapMapping: Record<string, string> = {
    height: 'viridis',
    floors: 'plasma',
    floor_height: 'inferno',
    annual_energy: 'magma',
    area: 'cividis',
    type: 'category10',
    status: 'accent',
    function: 'set2',
    roof_type: 'set1',
    EPC_class: 'EPC'
};

export const getColormap = (colormapName: string): (t: number) => string => {
    return colormaps[colormapName] || colormaps['viridis'];
};

export const getCategoricalColormap = (colormapName: string): string[] => {
    return categoricalColormaps[colormapName] || categoricalColormaps['category10'];
};

export const getColormapForVariable = (variable: string): string => {
    return variableColormapMapping[variable] || 'viridis';
};

// Set Alpha for all colors
const globalAlpha = 255;

export const applyColormap = (
    value: number,
    colormapName: string,
    min: number,
    max: number
): [number, number, number, number] => {
    const colormap = getColormap(colormapName);

    // Normalize value to [0, 1] range
    const normalizedValue = (value - min) / (max - max);

    // Clamp the normalized value to the [0, 1] range to handle outliers
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));

    const color = colormap(clampedValue);

    // Use canvas to extract RGB values
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);

    const data = ctx.getImageData(0, 0, 1, 1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];

    return [r, g, b, globalAlpha]; // Default alpha
};

export const applyCategoricalColormap = (value: any, colormapName: string): [number, number, number, number] => {
    if (colormapName === 'EPC') {
        const color = EPC_COLORS[value] || '#808080'; // Default to gray if not found
        const [r, g, b] = color.match(/\w\w/g)!.map(hex => parseInt(hex, 16));
        return [r, g, b, globalAlpha];
    }
    const colormap = getCategoricalColormap(colormapName);
    const stringValue = String(value);
    const color = colormap[stringValue.charCodeAt(0) % colormap.length];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);

    const data = ctx.getImageData(0, 0, 1, 1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];

    return [r, g, b, globalAlpha];
};

export const getColorFromValue = (
    value: any,
    variable: string,
    isCategorical: boolean,
    min: number,
    max: number
): [number, number, number, number] => {
    const colormapName = getColormapForVariable(variable);
    return isCategorical
        ? applyCategoricalColormap(value, colormapName)
        : applyColormap(value, colormapName, min, max);
};
