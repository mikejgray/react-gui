import React, { useState, useEffect } from "react";
import { Face } from "./widgets/face/face";
import SpeakerIcon from '@mui/icons-material/Speaker';
import InfoIcon from '@mui/icons-material/Info';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { WebsocketConnection } from "./widgets/websocketConnection/websocketConnection";
import { Accordion, AccordionSummary, AccordionDetails, Badge, Button, Stack, Typography } from "@mui/material";
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
import { CSSTransition } from 'react-transition-group';
import NotificationModal from "../NotificationModal/NotificationModal";
import SwipeableTopDrawer from "../SwipeableTopDrawer/SwipeableTopDrawer";
import ClockOverlay from "./ClockOverlay/ClockOverlay";
import CustomModal from "./CustomModal/CustomModal";
import AssistantReadyOverlay from "./AssistantReadyOverlay/AssistantReadyOverlay";
import { WallpaperPicker } from '../WallpaperPicker/WallpaperPicker';
import defaultWallpaper from './wallpaper/default.jpg';
import Wallpaper01 from './wallpaper/background-01.png';
import Wallpaper02 from './wallpaper/background-02.png';
import Wallpaper03 from './wallpaper/background-03.png';
import Wallpaper04 from './wallpaper/background-04.png';
import Wallpaper05 from './wallpaper/background-05.png';
import WebpageModal from "./WebpageModal/WebpageModal";

// TODO: Start abstracting out components
// TODO: HtmlModal testing...I think it works but I can't test reliably
// TODO: Fix date_time skill
// TODO: Weather skill
// TODO: Settings
// TODO: Move wallpaper picker to settings/a modal, probably (maybe just a generic modal that can accept the wallpaper picker or other components)
// TODO: Fix update of skill examples - may have resolved itself
// TODO: Get notifications modal working
// TODO: Skeleton components for when no websocket connection is available
// TODO: Support examples_prefix, randomize_examples, examples_enabled
// TODO: Then implement mycroft.session.list.remove, mycroft.session.list.move, mycroft.events.triggered (skill history)
// TODO: Make sure we are passing listener events to the GUI bus, so we can change the border color of homescreen
// TODO: Skeleton for image loading in CustomModal (https://stackoverflow.com/questions/56948061/show-a-react-skeleton-loader-until-a-image-load-completely#56948751)
// TODO: Actually serve GUI files from an API so the GUI can reach them


const MycroftMessageBus = () => {
	const wallpapers = [defaultWallpaper, Wallpaper01, Wallpaper02, Wallpaper03, Wallpaper04, Wallpaper05];

	const [wsReadyState, setWsReadyState] = useState(null);
	const [activeSkills, setActiveSkills] = useState(null);
	const [faceActive, setFaceActive] = useState(false);
	const [activeSkillState, setActiveSkillState] = useState(null);
	const [randomExample, setRandomExample] = useState("");
	const [examplesArray, setExamplesArray] = useState([]);
	const [skillStates, setSkillStates] = useState({});
	const [inProp, setInProp] = useState(false);
	const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
	const [showClockOverlay, setShowClockOverlay] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [isAssistantReady, setIsAssistantReady] = useState(false);
	const [assistantTitle, setAssistantTitle] = useState(null);
	const [assistantText, setAssistantText] = useState(null);
	const [assistantImageUrl, setAssistantImageUrl] = useState(null);
	const [assistantCaption, setAssistantCaption] = useState(null);
	const [timeString, setTimeString] = useState(null);
	const [selectedWallpaper, setSelectedWallpaper] = useState(wallpapers[0]);
	const [modalUrl, setModalUrl] = useState(null);
	const [webpageModalOpen, setWebpageModalOpen] = useState(false);
	const [listening, setListening] = useState(false);

	const handleOpen = () => setModalOpen(true);
	const handleClose = () => {
		setModalOpen(false);
		setAssistantTitle(null);
		setAssistantText(null);
		setAssistantImageUrl(null);
		setAssistantCaption(null);
	}
	useEffect(() => {
		console.log(`wsReadyState: ${wsReadyState}`)
		if (wsReadyState === null || wsReadyState === 3) {
			console.log(`Connecting to core websocket, wsReadyState: ${wsReadyState}`);
			connectToCoreWebSocket();
		}
	}, [wsReadyState]);
	// Use effect to auto-close and clear the modal after 5 seconds
	useEffect(() => {
		let timer;
		if (modalOpen) {
			timer = setTimeout(() => {
				handleClose(); // This will now also clear the content
			}, 5000);
		}
		// Cleanup timer if modal is closed before timer runs out
		return () => clearTimeout(timer);
	}, [modalOpen]);

	const connectToCoreWebSocket = () => {
		const gui_ws = new WebSocket(`ws://localhost:18181/gui`);
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
			switch (gui_msg.type) {
				case "recognizer_loop:wakeword":
					console.log("wakeword activated")
					setListening(true);
					break;
				case "recognizer_loop:record_end":
					console.log("recording ended")
					setListening(false);
					break;
				case "recognizer_loop:sleep":
					console.log("sleep");
					setShowClockOverlay(true);
					break;
				case "recognizer_loop:wake_up":
					console.log("wake_up");
					setShowClockOverlay(false);
					break;
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
					setIsAssistantReady(true);
					setTimeout(() => setIsAssistantReady(false), 5000);
					break;
				case "mycroft.session.list.insert":
					console.debug(gui_msg);
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
					console.debug(gui_msg);
					setSkillStates(prevStates => {
						const newStates = { ...prevStates };
						let namespaceData = newStates[gui_msg.namespace] || {};
						namespaceData = { ...namespaceData, ...gui_msg.data };
						newStates[gui_msg.namespace || "bugz"] = namespaceData;
						return newStates;
					});
					// Combine namespace data, since it can come in piecemeal
					let namespaceData = skillStates[gui_msg.namespace] || {};
					namespaceData = { ...namespaceData, ...gui_msg.data };
					skillStates[gui_msg.namespace || "bugz"] = namespaceData;
					const merged_namespace_state = { ...activeSkillState, ...gui_msg.data }
					console.log(`got updated data: ${JSON.stringify(gui_msg.data)}`);
					setActiveSkillState(merged_namespace_state);
					// Handle specific skills
					if (gui_msg.namespace !== "ovos.common_play") {
						console.log("Attempting to parse as a default GUI message")
						if (gui_msg.data.url) {
							setModalUrl(gui_msg.data.url);
							setWebpageModalOpen(true);
						}
						if (gui_msg.data.text) {
							setAssistantText(gui_msg.data.text);
						}
						if (gui_msg.data.title) {
							setAssistantTitle(gui_msg.data.title);
						}
						if (gui_msg.data.image) {
							setAssistantImageUrl(gui_msg.data.image);
						}
						if (gui_msg.data.caption) {
							setAssistantCaption(gui_msg.data.caption);
						}
						if (gui_msg.data.text || gui_msg.data.title || gui_msg.data.image || gui_msg.data.caption) {
							setModalOpen(true);
						} else {
							console.log(`Unhandled ${JSON.stringify(gui_msg.namespace)} data: ${JSON.stringify(gui_msg.data)}`)
						}
					} else { console.log(`ovos.common_play data: ${JSON.stringify(gui_msg.data)}`) }
					if (gui_msg.namespace === "skill-fallback_unknown.neongeckocom") {
						setAssistantText(gui_msg.data.utterance);
						setAssistantTitle("I heard:")
						setModalOpen(true);
					}
					if (gui_msg.namespace === "skill-date_time.neongeckocom") { // TODO:
						setAssistantText(time_string || "No time data available");
						setAssistantTitle("Current time")
						setModalOpen(true);
					}
					break;
				case "mycroft.gui.list.insert":
					console.debug(gui_msg);
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
					break;
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
		if (skillStates["skill-date_time.neongeckocom"]) {
			const data = skillStates["skill-date_time.neongeckocom"];
			setTimeString(`${data.hours}:${data.minutes}${data.ampm ? ` ${data.ampm}` : ""}`);
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
		</div >
	)

	return (
		<div>
			{isAssistantReady && <AssistantReadyOverlay />}
			<SwipeableTopDrawer contents={contents} />
			{/* Homescreen Replacement */}
			<Box sx={{
				border: listening ? '4px solid green' : undefined,
				padding: '16px', // or any other value that gives a good appearance
				borderRadius: '8px', // optional, for rounded corners
				backgroundImage: `url(${selectedWallpaper})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				height: '100%'
			}}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
					{/* Notifications */}
					<Badge badgeContent={notificationCount} color="primary" onClick={() => setIsNotificationsModalOpen(true)}>
						<NotificationsIcon />
					</Badge>
					{/* Weather */}
					<Stack direction="row" alignItems="center" spacing={1}>
						{weatherIcon(currentWeatherCondition)}
						<Typography>{`${temperature}°`}</Typography>
					</Stack>
				</Stack>
				<Box sx={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					padding: '16px', // Add padding as needed
				}}>
					<WallpaperPicker wallpapers={wallpapers} onSelect={setSelectedWallpaper} />
					{/* Troubleshooting for default modal */}
					<Button onClick={handleOpen}>Open Modal</Button>
					<CustomModal
						isOpen={modalOpen}
						handleClose={handleClose}
						title={assistantTitle || null}
						text={assistantText || null}
						imageUrl={assistantImageUrl || null}
						caption={assistantCaption || null}
					/>
					<WebpageModal isOpen={webpageModalOpen} handleClose={() => setWebpageModalOpen(false)} url={modalUrl} />
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
			</Box>
			{/* Left button for the clock overlay */}
			<Box
				onClick={() => setShowClockOverlay(!showClockOverlay)}
				sx={{
					cursor: 'pointer',
					position: 'fixed',
					top: '50%',
					left: 8,
					transform: 'translateX(-50%)',
					width: '4px',
					height: '30px',
					backgroundColor: '#ffffff', // Solid white color
					borderRadius: '2px',
					boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', // More prominent shadow
					zIndex: 1300,
				}}
			>
			</Box>
			<Box onClick={() => setShowClockOverlay(!showClockOverlay)}>
				<ClockOverlay showClockOverlay={showClockOverlay} timeString={time_string} />
			</Box>
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
		return icons[condition] || <WbSunnyIcon />; // Default icon if condition is not found TODO: Don't make it sunny at night
	}
};

export default MycroftMessageBus;

function getDate(weekday_string, month_string, day_string, year_string) {
	return <Typography variant="h3">{weekday_string} {month_string} {day_string}, {year_string}</Typography>;
}

function getClock(time_string, ampm_string) {
	return <Typography variant="h1">{time_string} {ampm_string}</Typography>;
}

