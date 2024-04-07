import React from 'react';
import { Box, Button } from "@mui/material";

export const WallpaperPicker = ({ wallpapers, onSelect }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
            {wallpapers.map((wallpaper, index) => (
                <Button key={index} onClick={() => onSelect(wallpaper)} style={{ padding: 0, minWidth: 'auto' }}>
                    <img src={wallpaper} alt={`Wallpaper ${index + 1}`} style={{ width: 100, height: 100 }} />
                </Button>
            ))}
        </Box>
    );
};


export default WallpaperPicker;
