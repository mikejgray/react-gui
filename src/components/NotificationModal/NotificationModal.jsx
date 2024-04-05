import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationModal = ({ isOpen, onClose, notifications }) => {
    return (
        <>
            <IconButton onClick={onClose}>
                <NotificationsIcon />
            </IconButton>
            <Dialog open={isOpen} onClose={onClose}>
                <DialogTitle>Notifications</DialogTitle>
                <DialogContent>
                    {notifications.storedmodel.map((notification, index) => (
                        <DialogContentText key={index}>
                            {notification.text}
                        </DialogContentText>
                    ))}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NotificationModal;
