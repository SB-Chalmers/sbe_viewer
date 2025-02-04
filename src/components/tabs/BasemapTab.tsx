import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { tabContainerStyle } from '../tabs/TabStyles'; // Use MUI v5 styles
interface BasemapTabProps {
    onBasemapChange: (basemapStyle: string) => void;
}

const BasemapTab: React.FC<BasemapTabProps> = ({ onBasemapChange }) => {
    const [selectedBasemap, setSelectedBasemap] = useState('mapbox://styles/mapbox/light-v10');

    const basemaps = [
        { id: 'mapbox://styles/mapbox/light-v10', name: 'Light' },
        { id: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite' },
        { id: 'mapbox://styles/mapbox/outdoors-v11', name: 'Terrain' },
        { id: 'mapbox://styles/mapbox/streets-v11', name: 'Streets' },
        { id: 'mapbox://styles/mapbox/dark-v10', name: 'Dark' },
    ];

    const handleBasemapChange = (event: SelectChangeEvent<string>) => {
        const newBasemap = event.target.value;
        setSelectedBasemap(newBasemap);
        onBasemapChange(newBasemap);
    };

    return (
        <Box sx={tabContainerStyle}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1E1E2D' }}>
                Basemap Selection
            </Typography>
            <Select
                fullWidth
                value={selectedBasemap}
                onChange={handleBasemapChange}
                sx={{ backgroundColor: '#FFFFFF', color: '#1E1E2D' }}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 200,
                            overflow: 'auto',
                        },
                    },
                }}
            >
                {basemaps.map((basemap) => (
                    <MenuItem key={basemap.id} value={basemap.id}>
                        {basemap.name}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
};

export default BasemapTab;
