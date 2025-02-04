import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Tooltip,
    Divider,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    FileUpload as FileUploadIcon,
    Layers as LayersIcon,
    Map as MapIcon,
    WbSunny as WbSunnyIcon,
} from '@mui/icons-material';
import HomeTab from './tabs/HomeTab';
import ImportDataTab from './tabs/ImportDataTab';
import LayerManagementTab from './tabs/LayerManagementTab';
import BasemapTab from './tabs/BasemapTab';
import LightingTab from './tabs/LightingTab';
import { Layer as DeckLayer } from '@deck.gl/core'; 

interface LayerWithVisibility extends DeckLayer {
    visible: boolean;
}

interface LeftDrawerProps {
    resetView: () => void;
    onBasemapChange: (style: string) => void;
    layers: LayerWithVisibility[]; // Use LayerWithVisibility
    onVisibilityToggle: (id: string) => void;
    onColorByChange: (colorBy: string) => void;
}

const LeftDrawer: React.FC<LeftDrawerProps> = ({ resetView, onBasemapChange, layers, onVisibilityToggle, onColorByChange }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [basemapStyle, setBasemapStyle] = useState('mapbox://styles/mapbox/light-v10');

    const handleListItemClick = (index: number) => {
        setSelectedIndex(index);
    };

    const handleBasemapChange = (style: string) => {
        setBasemapStyle(style);
        onBasemapChange(style);
    };

    const tabs = [
        { component: <HomeTab resetView={resetView} />, icon: <DashboardIcon fontSize="large" />, tooltip: "Home" },
        { component: <ImportDataTab />, icon: <FileUploadIcon fontSize="large" />, tooltip: "Import Data" },
        { component: <LayerManagementTab layers={layers} onVisibilityToggle={onVisibilityToggle} onColorByChange={onColorByChange} />, icon: <LayersIcon fontSize="large" />, tooltip: "Layer Management" },
        { component: <BasemapTab onBasemapChange={handleBasemapChange} />, icon: <MapIcon fontSize="large" />, tooltip: "Basemap" },
        { component: <LightingTab />, icon: <WbSunnyIcon fontSize="large" />, tooltip: "Lighting" },
    ];

    return (
        <Box sx={{ 
            display: 'flex',
            backgroundColor: 'var(--bg-light)',
            minHeight: '100vh'
        }}>
            <Drawer
                variant="permanent"
                anchor="left"
                sx={{
                    width: 70,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 70,
                        boxSizing: 'border-box',
                        backgroundColor: 'var(--drawer-background)',
                        color: 'var(--drawer-text)',
                        overflowX: 'hidden',
                        position: 'relative',
                        height: '100%'
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1 }}>
                    <Typography variant="h6" noWrap sx={{ color: 'var(--drawer-text)', ml: 1 }}>SBE</Typography>
                </Box>

                <Divider sx={{ backgroundColor: 'var(--drawer-divider)' }} />

                <List>
                    {tabs.map((tab, index) => (
                        <Tooltip key={index} title={tab.tooltip} placement="right">
                            <ListItemButton
                                selected={selectedIndex === index}
                                onClick={() => handleListItemClick(index)}
                                disableGutters
                                sx={{ justifyContent: 'center' }}
                            >
                                <ListItemIcon sx={{ color: 'var(--drawer-text)', minWidth: 'auto' }}>
                                    {tab.icon}
                                </ListItemIcon>
                            </ListItemButton>
                        </Tooltip>
                    ))}
                </List>

                <Divider sx={{ backgroundColor: 'var(--drawer-divider)' }} />
            </Drawer>
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    backgroundColor: 'var(--bg-light)',
                    minHeight: '100vh'
                }}
            >
                {tabs[selectedIndex].component}
            </Box>
        </Box>
    );
};

export default LeftDrawer;