import React, { useState, useEffect } from "react";
import { Face } from "./widgets/face/face";
import SpeakerIcon from '@mui/icons-material/Speaker';
import InfoIcon from '@mui/icons-material/Info';
import SkillComponent from "./skill_component_handler";
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import { WebsocketConnection } from "./widgets/websocketConnection/websocketConnection";
import { Accordion, AccordionSummary, AccordionDetails, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThermostatIcon from '@mui/icons-material/Thermostat';

// TODO: Next, a very basic homescreen, then implement mycroft.session.list.remove, mycroft.session.list.move, mycroft.events.triggered

let skillStates = {};

const MycroftMessageBus = () => {
	const [wsReadyState, setWsReadyState] = useState(null);
	const [activeSkills, setActiveSkills] = useState(null);
	const [faceActive, setFaceActive] = useState(false);
	const [activeSkillState, setActiveSkillState] = useState(null);

	useEffect(() => {
		if (wsReadyState === null || wsReadyState === 3) {
			connectToCoreWebSocket();
		}
	}, [wsReadyState]);

	const connectToCoreWebSocket = () => {
		const gui_ws = new WebSocket(`ws://192.168.86.50:18181/gui`);
		handleGuiMessages(gui_ws);
		gui_ws.onopen = () => {
			console.log("Websocket connection established");
			setWsReadyState(gui_ws.readyState);
			announceConnection(gui_ws);
		};
		gui_ws.onclose = () => {
			setWsReadyState(gui_ws.readyState);
		};
	};

	const announceConnection = (web_socket) => {
		console.log("announcing connection");
		web_socket.send(
			JSON.stringify({
				type: "mycroft.gui.connected",
				gui_id: "js_gui",
				framework: "react",
			})
		);
	};

	const handleGuiMessages = (gui_ws) => {
		const setFaceState = (active) => {
			setFaceActive(active);
		};

		gui_ws.onmessage = (event) => {
			const gui_msg = JSON.parse(event.data);
			console.debug(gui_msg);
			switch (gui_msg.type) {
				case "recognizer_loop:audio_output_start":
					console.log(`audio_output_start`);
					setFaceState(true);
					break;
				case "recognizer_loop:audio_output_end":
					console.log(`audio_output_end`);
					setFaceState(false);
					break;
				case "mycroft.ready":
					console.log("The assistant is ready.");
					break;
				case "mycroft.session.list.insert":
					const skillData = gui_msg.data && gui_msg.data.length > 0 ? gui_msg.data[0] : null;
					if (skillData) {
						const skill_id = skillData.skill_id ?? 'missing-skill-id';
						console.log(`got update from ${skill_id}`);
						setActiveSkills(skillData.skill_id ?? 'missing-skill-id');
						setActiveSkillState({ ...skillData });
					} else {
						console.warn("Invalid data received for mycroft.session.list.insert");
						console.info("Data:", gui_msg.data);
					}
					break;
				case "mycroft.session.set":
					let namespaceData = skillStates[gui_msg.namespace] || {};
					namespaceData = { ...namespaceData, ...gui_msg.data };
					skillStates[gui_msg.namespace || "bugz"] = namespaceData;
					// if (activeSkillState) {
					const merged_namespace_state = { ...activeSkillState, ...gui_msg.data }
					// const merged_namespace_state = Object.assign({}, activeSkillState, gui_msg.data);
					console.log(`got updated data: ${JSON.stringify(gui_msg.data)}`);
					setActiveSkillState(merged_namespace_state);
					// } else {
					// 	console.warn("No active skill state to update");
					// 	console.debug(gui_msg.data)
					// }
					break;
				case "mycroft.gui.list.insert":
					if (gui_msg.data && Array.isArray(gui_msg.data)) {
						const pageList = gui_msg.data.map((item) => item["url"]);
						console.log(`got pages: ${pageList}`);

						setActiveSkillState((prevState) => ({
							...prevState,
							components: pageList,
							component_focus: gui_msg.position,
						}));
					} else {
						console.warn("Invalid data received for mycroft.gui.list.insert");
					}
					break;
				case "mycroft.events.triggered":
					console.log(`event triggered: ${gui_msg.event_name}`);

					if (gui_msg.event_name === "page_gained_focus" && activeSkillState) {
						const resetDisplayEvent = () => {
							setActiveSkillState((prevState) => ({
								...prevState,
								display: {
									display_event: null,
								},
							}));
						};

						setActiveSkillState((prevState) => ({
							...prevState,
							component_focus: gui_msg.data && gui_msg.data["number"] ? gui_msg.data["number"] : prevState.component_focus,
							display: {
								display_event: gui_msg.event_name,
								display_event_callback: resetDisplayEvent,
							},
						}));

						setActiveSkills(gui_msg.namespace);
					} else {
						console.warn("Invalid event or no active skill state");
					}
					break;
				default:
					console.log("Unhandled message type: " + gui_msg.type);
			}
		};
	};

	const label = `Speaking: ${JSON.stringify(faceActive)}`;
	const activeSkillLabel = `Active skill: ${activeSkills ?? "None"}`;
	const mostRecentState = `Most recent state: ${JSON.stringify(activeSkillState) ?? "N/A"}`;
	const accordionDetails = JSON.stringify(skillStates, null, 2);
	let homescreenState = skillStates["skill-ovos-homescreen.openvoiceos"];
	let examplesArray = homescreenState?.skill_examples?.examples;
	let randomExample = examplesArray ? examplesArray[Math.floor(Math.random() * examplesArray.length)] : "";
	let temperature = homescreenState?.weather_temp;

	return (
		// SwipeableDrawer
		<div>
			<Container maxWidth="lg">
				<Stack spacing={1}>
					<Chip label="NEON AI" title="NEON AI" color="success" />
					<Stack direction="row" spacing={1}>
						<WebsocketConnection connected={wsReadyState === 1} />
						<Chip icon={<SpeakerIcon />} label={label} variant="outlined" color="info" />
						<Chip icon={<ThermostatIcon />} label={`${temperature} degrees`} variant="outlined" color="info" />
					</Stack>
					<Stack direction="row" spacing={1}>
						<Chip icon={<InfoIcon />} label={activeSkillLabel} variant="outlined" color="warning" />
						<Chip label={mostRecentState} variant="outlined" color="warning" />
					</Stack>
					<Accordion style={{ backgroundColor: 'grey' }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography>Skill states</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<pre>{accordionDetails}</pre>
						</AccordionDetails>
					</Accordion>
					{/* Clock and date */}
					<Typography>{homescreenState?.time_string} {homescreenState?.ampm_string}</Typography>
					<Typography>{homescreenState?.weekday_string} {homescreenState?.month_string} {homescreenState?.day_string}, {homescreenState?.year_string}</Typography>
					{/* Skill examples */}
					<Typography>Try saying: "{randomExample}"</Typography>
				</Stack>
				{/* {activeSkills && activeSkillState && (
					<SkillComponent
					activeSkill={activeSkills}
					skillState={activeSkillState}
					/>
				)} */}
			</Container>
			<Face active={faceActive} />
		</div>
	);
};

export default MycroftMessageBus;
