// SimpleLayout.js
import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

const SimpleLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1, padding: 3 }}>
                {children}
            </Box>
        </Box>
    );
};

export default SimpleLayout;
