import React, { useState, useEffect } from "react";
import { Face } from "./widgets/face/face";
import SpeakerIcon from '@mui/icons-material/Speaker';
import InfoIcon from '@mui/icons-material/Info';
import SkillComponent from "./skill_component_handler";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { WebsocketConnection } from "./widgets/websocketConnection/websocketConnection";
import { Accordion, AccordionSummary, AccordionDetails, Badge, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloudIcon from '@mui/icons-material/Cloud';
import BlurOnIcon from '@mui/icons-material/BlurOn'; // Alternative for fog
import NightsStayIcon from '@mui/icons-material/NightsStay'; // For moon
import FilterDramaIcon from '@mui/icons-material/FilterDrama'; // Partial clouds
import GrainIcon from '@mui/icons-material/Grain'; // Alternative for rain
import AcUnitIcon from '@mui/icons-material/AcUnit'; // For snow
import FlashOnIcon from '@mui/icons-material/FlashOn'; // For storm
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // For sun
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Alternative for sunset
import AirIcon from '@mui/icons-material/Air'; // For wind
import backgroundImage from './wallpaper/default.jpg'; // adjust the relative path as necessary
import { CSSTransition } from 'react-transition-group';
import NotificationModal from "../NotificationModal/NotificationModal";
import SwipeableTopDrawer from "../SwipeableTemporaryDrawer/SwipeableTemporaryDrawer";

// TODO: Fix update of skill examples
// TODO: Get notifications modal working
// TODO: Implement default OVOS screens
// TODO: Then implement mycroft.session.list.remove, mycroft.session.list.move, mycroft.events.triggered
// TODO: Make sure we are passing listener events to the GUI bus, so we can change the border color of homescreen

let skillStates = {};

const MycroftMessageBus = () => {
	const [wsReadyState, setWsReadyState] = useState(null);
	const [activeSkills, setActiveSkills] = useState(null);
	const [faceActive, setFaceActive] = useState(false);
	const [activeSkillState, setActiveSkillState] = useState(null);
	const [randomExample, setRandomExample] = useState("");
	const [examplesArray, setExamplesArray] = useState([]);
	const [skillStates, setSkillStates] = useState({});
	const [inProp, setInProp] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		if (wsReadyState === null || wsReadyState === 3) {
			connectToCoreWebSocket();
		}
	}, [wsReadyState]);

	const connectToCoreWebSocket = () => {
		const gui_ws = new WebSocket(`ws://neon-dk.local:18181/gui`);
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
					setSkillStates(prevStates => {
						const newStates = { ...prevStates };
						let namespaceData = newStates[gui_msg.namespace] || {};
						namespaceData = { ...namespaceData, ...gui_msg.data };
						newStates[gui_msg.namespace || "bugz"] = namespaceData;
						return newStates;
					});
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

	const updateRandomExample = () => {
		setInProp(false);
		// Set a timeout to change the example after the fade out
		setTimeout(() => {
			setRandomExample(examplesArray[Math.floor(Math.random() * examplesArray.length)] || "");
			// Fade in the new example
			setInProp(true);
		}, 300); // This should match the duration of your fade-out transition
	};
	useEffect(() => {
		updateRandomExample(); // Set the initial example without setting up an interval
	}, []); // Empty array ensures this only runs once on mount
	useEffect(() => {
		const interval = setInterval(updateRandomExample, 10000); // Set up the interval
		return () => clearInterval(interval); // Cleanup on unmount
	}, [examplesArray]); // Run when examplesArray changes
	useEffect(() => {
		const homescreenState = skillStates["skill-ovos-homescreen.openvoiceos"];
		if (homescreenState?.skill_examples?.examples) {
			setExamplesArray(homescreenState.skill_examples.examples);
		}
	}, [skillStates]); // React to changes in skillStates	  

	const speakingLabel = `Speaking: ${JSON.stringify(faceActive)}`;
	const activeSkillLabel = `Active skill: ${activeSkills ?? "None"}`;
	const accordionDetails = JSON.stringify(skillStates, null, 2);
	let homescreenState = skillStates["skill-ovos-homescreen.openvoiceos"];
	let temperature = homescreenState?.weather_temp;
	let skillInfoEnabled = homescreenState?.skill_info_enabled;
	let time_string = homescreenState?.time_string;
	let ampm_string = homescreenState?.ampm_string;
	let weekday_string = homescreenState?.weekday_string;
	let month_string = homescreenState?.month_string;
	let day_string = homescreenState?.day_string;
	let year_string = homescreenState?.year_string;
	let weatherCode = homescreenState?.weather_code;
	let currentWeatherCondition = weatherCode ? weatherCode.replace("icons/", "").replace(".svg", "") : "sun";
	let notificationModels = homescreenState?.notification_model;
	let notificationCount = notificationModels ? notificationModels.count : 0;
	const contents = (
		<div>
			<Container maxWidth="lg">
				<Chip label="NEON AI" title="NEON AI" color="success" />
				<Stack direction="row" spacing={1}>
					<WebsocketConnection connected={wsReadyState === 1} />
					<Chip icon={<SpeakerIcon />} label={speakingLabel} variant="outlined" color="info" />
				</Stack>
				<Stack direction="row" spacing={1}>
					<Chip icon={<InfoIcon />} label={activeSkillLabel} variant="outlined" color="warning" />
				</Stack>
				<Accordion style={{ backgroundColor: 'grey' }}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>Skill states</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<pre>{accordionDetails}</pre>
					</AccordionDetails>
				</Accordion>
			</Container>
		</div>
	)

	return (
		<div>
			<SwipeableTopDrawer contents={contents} />
			{/* Homescreen Replacement */}
			<Box sx={{
				border: '2px solid grey',
				padding: '16px', // or any other value that gives a good appearance
				borderRadius: '8px', // optional, for rounded corners
				backgroundImage: `url(${backgroundImage})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
					{/* Notifications */}
					<Badge badgeContent={notificationCount} color="primary" onClick={() => setIsModalOpen(true)}>
						<NotificationsIcon />
					</Badge>
					{/* Weather */}
					<Stack direction="row" alignItems="center" spacing={1}>
						{weatherIcon(currentWeatherCondition)}
						<Typography>{`${temperature}°`}</Typography>
					</Stack>
				</Stack>
				{/* Digital Clock */}
				<Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
					{time_string}{ampm_string}
				</Typography>
				{/* Date */}
				<Typography variant="h5" component="h2" sx={{ mb: 1 }}>
					{`${weekday_string}, ${day_string} ${month_string}, ${year_string}`}
				</Typography>
				<CSSTransition in={inProp} timeout={300} classNames="fade" onExited={updateRandomExample}>
					<Typography sx={{ fontStyle: 'italic' }}>
						Try saying: "{randomExample}"
					</Typography>
				</CSSTransition>
			</Box>
			{/* {activeSkills && activeSkillState && (
					<SkillComponent
					activeSkill={activeSkills}
					skillState={activeSkillState}
					/>
				)} */}
		</div >
		// <Face active={faceActive} />
	);

	function skillExamples() {
		if (skillInfoEnabled === true && randomExample) {
			return <Typography variant="h6" fontStyle="italic">Try saying: "{randomExample}"</Typography>;
		}
		return null;
	}
	function weatherIcon(condition) {
		const icons = {
			"cloud": <CloudIcon />,
			"fog": <BlurOnIcon />,
			"moon": <NightsStayIcon />,
			"partial_clouds": <FilterDramaIcon />,
			"partial_clouds_day": <FilterDramaIcon />,
			"partial_clouds_night": <NightsStayIcon />,
			"rain": <GrainIcon />,
			"snow": <AcUnitIcon />,
			"storm": <FlashOnIcon />,
			"sun": <WbSunnyIcon />,
			"sunrise": <Brightness4Icon />,
			"sunset": <Brightness4Icon />,
			"wind": <AirIcon />,
		};
		return icons[condition] || <WbSunnyIcon />; // Default icon if condition is not found
	}
};

export default MycroftMessageBus;

function getDate(weekday_string, month_string, day_string, year_string) {
	return <Typography variant="h3">{weekday_string} {month_string} {day_string}, {year_string}</Typography>;
}

function getClock(time_string, ampm_string) {
	return <Typography variant="h1">{time_string} {ampm_string}</Typography>;
}

