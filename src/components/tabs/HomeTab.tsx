import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { tabContainerStyle } from './TabStyles';

interface HomeTabProps {
    resetView: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ resetView }) => {
    return (
        <Box sx={tabContainerStyle}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1E1E2D' }}>
                Welcome to SBE Viewer
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: '#1E1E2D' }}>
                Use the Import Data tab to upload geoJSON files.
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: '#1E1E2D' }}>
                Navigate through Layers to reorder, rename, or style your data.
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: '#1E1E2D' }}>
                Adjust lighting in the Lighting tab.
            </Typography>
            <Button variant="contained" color="primary" onClick={resetView}>Reset View</Button>
        </Box>
    );
};

export default HomeTab;
