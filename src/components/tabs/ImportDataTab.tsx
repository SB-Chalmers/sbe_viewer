import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { tabContainerStyle } from './TabStyles';
import { API_ENDPOINTS } from '../../config/api';

const ImportDataTab: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setIsLoading(true);
        const files = event.target.files;

        if (files && files.length > 0) {
            const file = files[0];
            if (!file.name.toLowerCase().endsWith('.hbjson')) {
                setError('Please upload a .hbjson file');
                setIsLoading(false);
                return;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);

                const uploadResponse = await fetch(API_ENDPOINTS.uploadHBJSON, {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || `Upload failed with status: ${uploadResponse.status}`);
                }

                const responseData = await uploadResponse.json();
                console.log('File uploaded successfully:', responseData.filePath);
            } catch (error) {
                console.error('Error handling file:', error);
                setError(error instanceof Error ? error.message : 'Failed to process file');
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={tabContainerStyle}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1E1E2D' }}>
                Import Data
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box sx={{ 
                border: '2px dashed var(--upload-border)', 
                p: 2, 
                textAlign: 'center',
                '&:hover': {
                    borderColor: 'var(--accent-hover)'
                },
                position: 'relative'
            }}>
                {isLoading && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}>
                        <CircularProgress />
                    </Box>
                )}
                <Typography variant="body1" gutterBottom sx={{ color: '#1E1E2D' }}>
                    Drag and drop your HBJSON files here
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