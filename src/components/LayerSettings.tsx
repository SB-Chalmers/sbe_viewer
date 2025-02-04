import React, { useState, useEffect } from 'react';
import { Collapse, FormControlLabel, Switch, Select, MenuItem, Paper, Tooltip, IconButton, SelectChangeEvent } from '@mui/material';
import { ExpandMore, ExpandLess, Layers } from '@mui/icons-material';

interface LayerSettingsProps {
    layers: any[];
    onToggleLayer: (layerId: string, enabled: boolean) => void;
    onVariableChange: (layerId: string, variable: string) => void;
    onColormapChange: (layerId: string, colormap: string) => void;
    onToggle3D: (layerId: string, enabled: boolean) => void;
}

const LayerSettings: React.FC<LayerSettingsProps> = ({ layers, onToggleLayer, onVariableChange, onColormapChange, onToggle3D }) => {
    const [expanded, setExpanded] = useState(false);
    const [layerStates, setLayerStates] = useState<{ [key: string]: boolean }>({});
    const [selectedVariables, setSelectedVariables] = useState<{ [key: string]: string }>({});
    const [selectedColormaps, setSelectedColormaps] = useState<{ [key: string]: string }>({});
    const [is3D, setIs3D] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const initialLayerStates = layers.reduce((acc, layer) => {
            acc[layer.id] = true;
            return acc;
        }, {} as { [key: string]: boolean });
        setLayerStates(initialLayerStates);
    }, [layers]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleToggleLayer = (layerId: string) => {
        const newState = !layerStates[layerId];
        setLayerStates({ ...layerStates, [layerId]: newState });
        onToggleLayer(layerId, newState);
    };

    const handleVariableChange = (layerId: string, event: SelectChangeEvent<string>) => {
        const variable = event.target.value as string;
        setSelectedVariables({ ...selectedVariables, [layerId]: variable });
        onVariableChange(layerId, variable);
    };

    const handleColormapChange = (layerId: string, event: SelectChangeEvent<string>) => {
        const colormap = event.target.value as string;
        setSelectedColormaps({ ...selectedColormaps, [layerId]: colormap });
        onColormapChange(layerId, colormap);
    };

    const handleToggle3D = (layerId: string) => {
        const newState = !is3D[layerId];
        setIs3D({ ...is3D, [layerId]: newState });
        onToggle3D(layerId, newState);
    };

    const predefinedAttributes = [
        'name', 'type', 'status', 'height', 'function', 'floors', 'floor_height', 'roof_type', 'EPC_class', 'annual_energy', 'area'
    ];

    const colormaps = ['viridis', 'plasma', 'inferno', 'category10']; // Example colormaps

    return (
        <div style={{ position: 'absolute', bottom: 100, right: 20, width: 300 }}>
            <Paper style={{ padding: 8, backgroundColor: '#f5f5f5' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Layer settings">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Layers />
                            <span style={{ marginLeft: 8 }}>Layer Settings</span>
                        </div>
                    </Tooltip>
                    <Tooltip title="Adjust layer settings">
                        <IconButton onClick={handleExpandClick} style={{ marginLeft: 'auto' }}>
                            {expanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Tooltip>
                </div>
            </Paper>
            <Collapse in={expanded}>
                <Paper style={{ padding: 16, marginTop: 8, backgroundColor: '#e0e0e0' }}>
                    {layers.map((layer) => (
                        <div key={layer.id} style={{ marginBottom: 16 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={layerStates[layer.id] || false}
                                        onChange={() => handleToggleLayer(layer.id)}
                                        color="primary"
                                    />
                                }
                                label={layer.id}
                            />
                            <Collapse in={layerStates[layer.id] || false}>
                                <div style={{ marginTop: 8 }}>
                                    <Select
                                        value={selectedVariables[layer.id] || ''}
                                        onChange={(event) => handleVariableChange(layer.id, event)}
                                        displayEmpty
                                        fullWidth
                                    >
                                        <MenuItem value="" disabled>
                                            Select Variable
                                        </MenuItem>
                                        {predefinedAttributes.map((variable) => (
                                            <MenuItem key={variable} value={variable}>
                                                {variable}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <Select
                                        value={selectedColormaps[layer.id] || ''}
                                        onChange={(event) => handleColormapChange(layer.id, event)}
                                        displayEmpty
                                        fullWidth
                                    >
                                        <MenuItem value="" disabled>
                                            Select Colormap
                                        </MenuItem>
                                        {colormaps.map((colormap) => (
                                            <MenuItem key={colormap} value={colormap}>
                                                {colormap}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={is3D[layer.id] || false}
                                            onChange={() => handleToggle3D(layer.id)}
                                            color="primary"
                                        />
                                    }
                                    label="3D Buildings"
                                />
                            </Collapse>
                        </div>
                    ))}
                </Paper>
            </Collapse>
        </div>
    );
};

export default LayerSettings;
