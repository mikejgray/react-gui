import React, { useEffect } from 'react';
import { Modal, Box, Typography, Button, useTheme } from '@mui/material';

const WebpageModal = ({ isOpen, handleClose, url, title }) => {
    const theme = useTheme();
    // Define the dynamic style outside the return statement or inside useEffect
    const dynamicStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%', // Adjust based on your needs
        height: '80%', // Adjust based on your needs
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto', // Allow scrolling within the modal
    };

    useEffect(() => {
        let timer;
        if (isOpen) {
            timer = setTimeout(() => {
                handleClose(); // Close the modal
            }, 5000); // Adjust time as needed
        }
        return () => clearTimeout(timer);
    }, [isOpen, handleClose]);

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={dynamicStyle}>
                {title && (
                    <Typography id="modal-title" variant="h6" component="h2" align="center" sx={{ mb: 2 }}>
                        {title}
                    </Typography>
                )}
                <Box
                    sx={{
                        width: '100%', // Ensure the iframe takes the full width of its parent
                        height: '100%', // Adjust the height as necessary
                    }}
                >
                    <iframe
                        src={url}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title="Webpage"
                    ></iframe>
                </Box>
                <Button onClick={handleClose} sx={{ mt: 2 }}>
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default WebpageModal;
