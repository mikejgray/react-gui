import React from "react";
import activeFace from "./assets/images/ai.gif";
import restingFace from "./assets/images/black-hole.gif";
import "./assets/css/face.css";
import { Card, CardMedia } from "@mui/material";

export function Face(props) {
	let faceState =
		(props.active === true) ? activeFace : restingFace;
	return <Card className="face-card"><CardMedia src={faceState} /></Card>
	// return <img src={faceState} className="face row" alt="logo" />;
}
