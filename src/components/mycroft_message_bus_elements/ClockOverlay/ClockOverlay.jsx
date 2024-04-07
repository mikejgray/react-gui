import React from 'react';
import { Box, Typography } from '@mui/material';

const ClockOverlay = ({ showClockOverlay, timeString }) => {
    return (
        <div>
            {/* Conditionally render the clock overlay */}
            {showClockOverlay && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        bgcolor: 'black',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1400, // Ensure it's above everything else
                    }}
                >
                    <Typography variant="h1" sx={{ color: 'white', fontSize: '20rem' }}
                        onClick={() => setShowClockOverlay(false)} // Hide overlay when clicked
                    >
                        {timeString}
                    </Typography>
                </Box>
            )}
        </div>
    );
};

export default ClockOverlay;
