import React from "react";
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Chip from '@mui/material/Chip';

export function WebsocketConnection(props) {
	let websocketConnectionState = (props.connected === true);
	const wsStatus = `Websocket Status: ${websocketConnectionState ? "Connected" : "Disconnected"}`
	const color = websocketConnectionState ? "success" : "error";
	return <div class="led-box">
		<Chip color={color} icon={<LightbulbIcon />} title={wsStatus} label={wsStatus} variant="outlined" />
	</div>;
}
