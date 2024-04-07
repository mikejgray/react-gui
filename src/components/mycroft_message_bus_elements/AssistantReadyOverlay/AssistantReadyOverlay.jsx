import React, { useState, useEffect } from 'react';

const AssistantReadyOverlay = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 5000); // Waits for the fade in and fade out to complete.

        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    // TODO: Configurable message
    return (
        <div className="overlay">
            Your assistant is ready
        </div>
    );
};

export default AssistantReadyOverlay;
