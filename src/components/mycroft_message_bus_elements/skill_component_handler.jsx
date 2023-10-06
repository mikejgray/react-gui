import React, {Component} from "react";
import "./default.scss";
import { GuiExamplesAiix } from "./skill_components/gui_examples_aiix";
import { MycroftDateTime } from "./skill_components/mycroft_date_time";
import { MycroftIp } from "./skill_components/mycroft_ip";
import { MycroftWiki } from "./skill_components/mycroft_wiki";
import { MycroftWeather } from "./skill_components/mycroft_weather/mycroft_weather";
import {skill_components} from "./skills";
import {system_components} from "./system";

export default function SkillComponentHandler(props) {
	function returnActiveSkillComponent() {
		const active_skill = props.activeSkill;
		const skill_state = props.skillState;
		const component_focus = skill_state["component_focus"];
		const component_name = skill_state["components"][component_focus];
		console.log(active_skill)
		console.log(skill_state)

		switch (active_skill) {
			case "gui-examples.aiix":
				return (
					<GuiExamplesAiix
						skillState={skill_state}
						componentName={component_name}
					/>
				);
			case "mycroft-date-time.mycroftai":
				return (
					<MycroftDateTime
						skillState={skill_state}
						componentName={component_name}
					/>
				);
			case "mycroft-ip.mycroftai":
				return (
					<MycroftIp
						skillState={skill_state}
						componentName={component_name}
					/>
				);
			case "mycroft-wiki.mycroftai":
				return (
					<MycroftWiki
						skillState={skill_state}
						componentName={component_name}
					/>
				);
			case "mycroft-weather.mycroftai":
				return (
					<MycroftWeather
						skillState={skill_state}
						componentName={component_name}
					/>
				);
			default:
				if ( component_name.endsWith('.qml')) {
					console.log(`ERROR: Ignoring request for ${component_name}`)
					return null
				}
				console.log(`Loading ${component_name}`);
				try {
					let resource_name = String(component_name).substring(component_name.lastIndexOf('/') + 1)
					resource_name = resource_name.substring(0, resource_name.lastIndexOf('.'))
					console.log(`Getting component: ${resource_name}`)
					let Component
					if (resource_name.startsWith("SYSTEM")) {
						Component = system_components[resource_name];
					} else {
						Component = skill_components[resource_name]
					}
					console.log(Component)
					return (
						<Component
							skillState={skill_state}
							componentName={component_name}
						/>
					);
				}
				catch (e) {
					console.log(e)
					return null;
				}
		}
	}

	return returnActiveSkillComponent()
}
