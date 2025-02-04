import React, { useState } from 'react';
import { 
    Box, Typography, List, ListItem, ListItemText, IconButton, Collapse, 
    Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import { 
    Visibility as VisibilityIcon, 
    VisibilityOff as VisibilityOffIcon, 
    ExpandMore, ExpandLess 
} from '@mui/icons-material';
import { tabContainerStyle } from './TabStyles';

interface LayerWithVisibility {
    id: string;
    visible: boolean;
}

interface LayerManagementTabProps {
    layers: LayerWithVisibility[];
    onVisibilityToggle: (id: string) => void;
    onColorByChange: (colorBy: string) => void;
}

const LayerManagementTab: React.FC<LayerManagementTabProps> = ({ layers, onVisibilityToggle, onColorByChange }) => {
    const [visibilityExpanded, setVisibilityExpanded] = useState(true);
    const [buildingsExpanded, setBuildingsExpanded] = useState(false);
    const [colorBy, setColorBy] = useState(''); // Set default value to empty string

    const predefinedLayers = [
        { id: 'buildings', name: 'Buildings' },
        { id: 'land-cover', name: 'Land Cover' },
        { id: 'tree-layer', name: 'Tree Layer' },
        { id: 'tree-points-layer', name: 'Tree Points Layer' },
        { id: 'hbjson-layer', name: 'HBJSON Layer' }
    ];

    const eligibleAttributes = [
        'type', 'status', 'height', 'function', 'floors', 
        'floor_height', 'roof_type', 'EPC_class', 'annual_energy', 'area'
    ];

    const handleColorByChange = (event: any) => {
        const variable = event.target.value;
        console.log('Selected color by attribute:', variable); // Add this line
        setColorBy(variable);
        onColorByChange(variable);
    };

    return (
        <Box sx={tabContainerStyle}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Layer Management
            </Typography>
            
            {/* Layer Visibility Section */}
            <Box mb={2}>
                <Typography 
                    variant="h6" 
                    onClick={() => setVisibilityExpanded(!visibilityExpanded)} 
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
                >
                    Layer Visibility {visibilityExpanded ? <ExpandLess /> : <ExpandMore />}
                </Typography>
                <Collapse in={visibilityExpanded} timeout="auto" unmountOnExit>
                    <List>
                        {predefinedLayers.map(layer => (
                            <ListItem key={layer.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ListItemText primary={layer.name} sx={{ fontWeight: 500 }} />
                                <IconButton 
                                    onClick={() => onVisibilityToggle(layer.id)}
                                    sx={{ 
                                        color: layers.find(l => l.id === layer.id)?.visible ? 
                                            'var(--icon-active)' : 'var(--text-light-secondary)' 
                                    }}
                                >
                                    {layers.find(l => l.id === layer.id)?.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </Collapse>
            </Box>

            {/* Buildings Section */}
            <Box>
                <Typography 
                    variant="h6" 
                    onClick={() => setBuildingsExpanded(!buildingsExpanded)} 
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
                >
                    Buildings {buildingsExpanded ? <ExpandLess /> : <ExpandMore />}
                </Typography>
                <Collapse in={buildingsExpanded} timeout="auto" unmountOnExit>
                    <FormControl fullWidth margin="normal" sx={{ mt: 2 }}>
                        <InputLabel sx={{ 
                            mb: 1,
                            color: 'var(--text-light)',
                            '&.Mui-focused': {
                                color: 'var(--text-light)'
                            }
                        }}>Color By</InputLabel>
                        <Select 
                            value={colorBy} 
                            onChange={handleColorByChange}
                            sx={{
                                color: 'var(--text-light)',
                                backgroundColor: 'var(--bg-light)',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--border-light)',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'var(--text-light)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--accent-primary)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--accent-primary)',
                                }
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: 'var(--bg-light)',
                                        color: 'var(--text-light)',
                                        '& .MuiMenuItem-root': {
                                            color: 'var(--text-light)',
                                            '&:hover': {
                                                backgroundColor: 'var(--bg-light-secondary)',
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: 'var(--accent-primary)',
                                                color: 'var(--button-text-primary)',
                                                '&:hover': {
                                                    backgroundColor: 'var(--accent-hover)',
                                                }
                                            }
                                        }
                                    }
                                }
                            }}
                        >
                            {eligibleAttributes.map(attr => (
                                <MenuItem key={attr} value={attr}>{attr}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Collapse>
            </Box>
        </Box>
    );
};

export default LayerManagementTab;