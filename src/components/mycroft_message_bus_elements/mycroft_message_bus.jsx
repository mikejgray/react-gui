import React, { Component, useState } from "react";
import { Face } from "./widgets/face/face";
import SkillComponent from "./skill_component_handler";

export default class MycroftMessageBus extends Component {
	constructor(props) {
		super(props);
		this.state = {
			"ws.readyState": null,
			"mycroft.system.active_skills": null,
			"face.active": false,
		};
	}

	componentDidMount() {
		if ((this.state["ws.readyState"] = null || 3)) {
			this.connectToCoreWebSocket();
		}
	}

	connectToCoreWebSocket() {
		// TODO: Build URL from config (ssl, host, port, route)
		var gui_ws = new WebSocket(`ws://localhost:18181/gui`);
		this.handleGuiMessages(gui_ws);
		// var ws = new WebSocket("ws://localhost:8181/core");
		gui_ws.onopen = (event) => {
			console.log("Websocket connection established")
			this.updateWebSocketReadyState(gui_ws);
			this.announceConnection(gui_ws);
		};
		// this.handleCoreMessages(ws);
		gui_ws.onclose = () => {
			this.updateWebSocketReadyState(gui_ws);
		};
	}

	updateWebSocketReadyState(web_socket) {
		this.setState(
			{
				["ws.readyState"]: web_socket.readyState,
			},
			() => {
				console.log(`mycroft core ready state: ${this.state["ws.readyState"]}`);
			}
		);
	}

	announceConnection(web_socket) {
		console.log('announcing connection')
		// qt implemented messages where `type` maps to `Message.msg_type` and all other keys map into `Message.data`
		web_socket.send(
			JSON.stringify({
				type: "mycroft.gui.connected",
				gui_id: "js_gui",
				framework: "react"
			})
		);
	}

	// handleCoreMessages(web_socket) {
	// 	let setFaceState = (active) => {
	// 		this.setState({ "face.active": active });
	// 	};
	// 	web_socket.onmessage = (event) => {
	// 		var msg = JSON.parse(event.data);
	// 		switch (msg.type) {
	// 			case "recognizer_loop:audio_output_start":
	// 				setFaceState(true);
	// 				break;
	// 			case "recognizer_loop:audio_output_end":
	// 				setFaceState(false);
	// 				break;
	// 			case "mycroft.ready":
	// 				console.log("Mycroft is ready.");
	// 				break;
	// 			case "mycroft.gui.port":
	// 				console.log(msg.type);
	// 				console.log(`connecting to mycroft gui at port: ${msg.data["port"]}`);
	// 				var gui_ws = new WebSocket(`ws://localhost:18181/gui`);
	// 				this.handleGuiMessages(gui_ws);
	// 				break;
	// 			default:
	// 			// Log unhandled messages
	// 			// console.log("Unhandled message type: " + msg.type);
	// 		}
	// 	};
	// }

	handleGuiMessages(gui_ws) {
		let setFaceState = (active) => {
			this.setState({ "face.active": active });
		};
		gui_ws.onmessage = (event) => {
			let gui_msg = JSON.parse(event.data);

			let component_namespace_state = Object.assign(
				{},
				this.state[gui_msg.namespace]
			);
			switch (gui_msg.type) {
				case "recognizer_loop:audio_output_start":
					console.log(`audio_output_start`)
					setFaceState(true);
					break;
				case "recognizer_loop:audio_output_end":
					console.log(`audio_output_end`)
					setFaceState(false);
					break;
				case "mycroft.ready":
					console.log("Mycroft is ready.");
					break;
				case "mycroft.session.list.insert":
					// Insert a new and reset existing skill namespace under mycroft.system.active_skill in state
					let skill_id = gui_msg.data[0]["skill_id"];
					console.log(`got update from ${skill_id}`)
					return this.setState({
						[gui_msg.namespace]: skill_id,
						[skill_id]: null,
					});
				case "mycroft.session.set":
					// Set all variables to the namespaces state
					let merged_namespace_state = Object.assign(
						component_namespace_state,
						gui_msg.data
					);
					console.log(`got updated data: ${gui_msg.data}`)
					return this.setState({
						[gui_msg.namespace]: merged_namespace_state,
					});
				case "mycroft.gui.list.insert":
					let filter_url = (page_url) => {
						return page_url
							.substring(page_url.lastIndexOf("/") + 1)
							.replace(".qml", "");
					};
					// iterate through page_urls only adding the component name to the array
					let page_list = gui_msg.data.map((i) => i["url"]);
					console.log(`got pages: ${page_list}`)

					// page_list should be a list of resolvable URIs (file:// or http://) now
					// assign pages list and determine page and component to focus
					component_namespace_state["components"] = page_list;
					component_namespace_state["component_focus"] = gui_msg.position;
					// component_namespace_state['displayEvent'] = gui_msg.event_name
					return this.setState({
						[gui_msg.namespace]: component_namespace_state,
					});
				case "mycroft.events.triggered":
					console.log(`event triggered: ${gui_msg.event_name}`)
					// Used to switch page within currently active namespace if page focus event
					if (gui_msg.event_name == "page_gained_focus") {
						let resetDisplayEvent = () => {
							component_namespace_state["display"] = {
								["display_event"]: null,
							};
							return this.setState({
								[gui_msg.namespace]: component_namespace_state,
							});
						};
						component_namespace_state["component_focus"] =
							gui_msg.data["number"];
						component_namespace_state["display"] = {
							["display_event"]: gui_msg.event_name,
							["display_event_callback"]: resetDisplayEvent,
						};
						return this.setState({
							["mycroft.system.active_skills"]: gui_msg.namespace,
							[gui_msg.namespace]: component_namespace_state,
						});
					}
				default:
					// Log unhandled messages
					console.log("Unhandled message type: " + gui_msg.type);
			}
		};
	}

	activeSkillComponent() {
		let active_skill = this.state["mycroft.system.active_skills"];
		let active_skill_state = this.state[active_skill];

		if (active_skill &&
				active_skill_state &&
			 (active_skill_state["component_focus"] >= 1 ||
				active_skill_state["component_focus"] == 0)
				) {
			return (
				<>
					<Face active={this.state["face.active"]} />
					<SkillComponent
						activeSkill={active_skill}
						skillState={active_skill_state}
					/>
				</>
			);
		}
		return <Face active={this.state["face.active"]} />
	}

	render() {
		return (
			<div className="container">
				{this.activeSkillComponent()}
			</div>
		)
	}
}
