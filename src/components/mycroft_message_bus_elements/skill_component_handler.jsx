import React, {Component, lazy, Suspense} from "react";
import "./default.scss";
import { GuiExamplesAiix } from "./skill_components/gui_examples_aiix";
import { MycroftDateTime } from "./skill_components/mycroft_date_time";
import { MycroftIp } from "./skill_components/mycroft_ip";
import { MycroftWiki } from "./skill_components/mycroft_wiki";
import { MycroftWeather } from "./skill_components/mycroft_weather/mycroft_weather";

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
					return null
				}
				console.log(`Loading ${component_name}`);
				// ../system/react/SYSTEM_TextFrame.jsx

				const RenderPage = lazy(() => import(`${component_name}`));
				console.log(RenderPage)
				return (
					<Suspense fallback={"Loading"}>
						<RenderPage
							skillState={skill_state}
							componentName={component_name}
						/>
					</Suspense>
				);
		}
	}

	return returnActiveSkillComponent()
}
