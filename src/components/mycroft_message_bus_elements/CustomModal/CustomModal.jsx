import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, useTheme, useMediaQuery, Skeleton } from '@mui/material';

const CustomModal = ({ isOpen, handleClose, title, text, imageUrl, caption }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    // Determine if there's only text and no image or caption
    const onlyText = !imageUrl && !caption;

    useEffect(() => {
        // Set a timeout to close the modal after a certain time
        let timer;
        if (isOpen) {
            timer = setTimeout(() => {
                handleClose(); // Close the modal
            }, 5000); // Keep the modal open for 5 seconds
        }
        // Clear the timeout if the modal is closed prematurely
        return () => clearTimeout(timer);
    }, [isOpen, handleClose]);

    // useEffect for clearing content when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Logic to clear the content goes here
        }
    }, [isOpen]);

    const dynamicStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '90%' : '95%', // Use most of the viewport width
        height: isMobile ? '90%' : '95%', // Use most of the viewport height
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        display: 'flex',
        flexDirection: 'column', // Align children vertically
        alignItems: 'center', // Center-align children
        overflowY: 'auto', // Allow scrolling for the whole modal content
    };

    const imageAndCaptionContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center-align image and caption
        width: '100%', // Image container takes full width of the modal content area
    };
    const imageContainerStyle = {
        width: '100%', // Full width of the modal content area
        maxHeight: imageUrl ? '50vh' : '0', // Use half the viewport height if image exists, otherwise no space
        overflow: 'hidden',
        textAlign: 'center', // Center the image in its container
    };

    const imageStyle = {
        maxWidth: '80%', // Allow image to be up to 80% of the modal width if no text
        maxHeight: '80vh', // Use more of the viewport height if no text or caption
        objectFit: 'contain',
    };

    const textStyle = {
        mt: 2, // Margin top for spacing
        fontSize: onlyText ? '5rem' : '2rem', // Larger font size if only text
        textAlign: 'center', // Center-align the text
        width: '100%', // Ensure text takes full width
    };

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
                {imageUrl && (
                    <Box sx={imageContainerStyle}>
                        <img
                            src={`${imageUrl}?w=248&fit=crop&auto=format`}
                            srcSet={`${imageUrl}?w=248&fit=crop&auto=format&dpr=2 2x`}
                            alt={caption || 'Image'}
                            loading="lazy"
                            style={imageStyle}
                        />
                    </Box>
                )}
                {caption && (
                    <Typography variant="caption" sx={{ mt: 1 }}>
                        {caption}
                    </Typography>
                )}
                <Typography sx={textStyle}>
                    {text}
                </Typography>
                <Button onClick={handleClose} sx={{ mt: 'auto', marginBottom: 2 }}>
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default CustomModal;