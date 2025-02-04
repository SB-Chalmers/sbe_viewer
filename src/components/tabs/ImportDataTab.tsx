import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { tabContainerStyle } from './TabStyles';

const ImportDataTab: React.FC = () => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            // Handle file upload logic here
        }
    };

    return (
        <Box sx={tabContainerStyle}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1E1E2D' }}>
                Import Data
            </Typography>
            <Box sx={{ 
                border: '2px dashed var(--upload-border)', 
                p: 2, 
                textAlign: 'center',
                '&:hover': {
                    borderColor: 'var(--accent-hover)'
                }
            }}>
                <Typography variant="body1" gutterBottom sx={{ color: '#1E1E2D' }}>
                    Drag and drop your geoJSON files here
                </Typography>
                <Button 
                    variant="contained" 
                    component="label"
                >
                    Click to Upload
                    <input type="file" hidden onChange={handleFileUpload} />
                </Button>
            </Box>
            {/* Add progress indicator and recent uploads list here */}
        </Box>
    );
};

export default ImportDataTab;
