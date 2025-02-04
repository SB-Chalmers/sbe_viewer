// src/components/tabs/TabStyles.tsx
import { SxProps } from '@mui/material';

export const tabContainerStyle: SxProps = {
    p: 2,
    width: '25vh', // Set a fixed width
    backgroundColor: 'var(--bg-light)',
    color: 'var(--text-light)',
    '& .MuiTypography-root': {
        color: 'var(--text-light)'
    },
    '& .MuiButton-root': {
        backgroundColor: 'var(--button-primary)',
        color: 'var(--button-text-primary)',
        '&:hover': {
            backgroundColor: 'var(--accent-hover)'
        },
        '&:active': {
            backgroundColor: 'var(--accent-active)'
        },
        '&.Mui-disabled': {
            backgroundColor: 'var(--accent-disabled)'
        }
    },
    '& .MuiSelect-root': {
        backgroundColor: 'var(--bg-light-secondary)',
        color: 'var(--text-light)'
    },
    '& .MuiMenuItem-root': {
        color: 'var(--text-light)'
    },
    '& .MuiSlider-root': {
        color: 'var(--slider-color)',
        '& .MuiSlider-thumb': {
            '&:hover': {
                boxShadow: '0 0 0 8px var(--accent-hover)'
            }
        }
    },
    '& .MuiSwitch-root': {
        '& .MuiSwitch-track': {
            backgroundColor: 'var(--text-light-secondary)'
        },
        '& .MuiSwitch-thumb': {
            backgroundColor: 'var(--switch-color)'
        }
    },
    '& .MuiIconButton-root': {
        '&.active': {
            color: 'var(--icon-active)'
        }
    }
};
