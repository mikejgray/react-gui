import React, { useState } from 'react';
import { Box, SwipeableDrawer } from '@mui/material';

const SwipeableTopDrawer = ({ contents }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            {/* This Box serves as the toggle button for the drawer */}
            <Box
                onClick={() => setIsDrawerOpen(!isDrawerOpen)} // Toggles the state
                sx={{
                    cursor: 'pointer',
                    position: 'fixed',
                    top: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '30px',
                    height: '4px',
                    backgroundColor: '#ffffff', // Solid white color
                    borderRadius: '2px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', // More prominent shadow
                    zIndex: 1300,
                }}
            />
            <SwipeableDrawer
                anchor="top"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onOpen={() => setIsDrawerOpen(true)}
            >
                {/* The contents passed as a prop are used here */}
                {contents}
            </SwipeableDrawer>
        </>
    );
};

export default SwipeableTopDrawer;
