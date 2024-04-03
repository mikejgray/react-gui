import React, { Component } from "react";
import "./default.scss";
import { GuiExamplesAiix } from "./skill_components/gui_examples_aiix";
import { MycroftDateTime } from "./skill_components/mycroft_date_time";
import { MycroftIp } from "./skill_components/mycroft_ip";
import { MycroftWiki } from "./skill_components/mycroft_wiki";
import { MycroftWeather } from "./skill_components/mycroft_weather/mycroft_weather";
import { skill_components } from "./skills";
import { system_components } from "./system";

export default function SkillComponentHandler(props) {
	function returnActiveSkillComponent() {
		const active_skill = props.activeSkill;
		const skill_state = props.skillState || {};
		const components = skill_state["components"] || [];
		const component_focus = skill_state["component_focus"] || 0;
		const component_name = components[component_focus] || "";

		console.log("Active Skill:", active_skill);
		console.log("Skill State:", skill_state);
		console.log("Component Focus:", component_focus);
		console.log("Component Name:", component_name);

		switch (active_skill) {
			case "gui-examples.aiix":
				return <GuiExamplesAiix skillState={skill_state} componentName={component_name} />;
			case "skill-ovos-date-time.openvoiceos":
				const {
					time_string,
					date_string,
					ampm_string,
					weekday_string,
					month_string,
					day_string,
					year_string,
					// ... any other properties from skillState that MycroftDateTime uses
				} = skill_state;
				return (
					<MycroftDateTime
						time_string={time_string}
						date_string={date_string}
						ampm_string={ampm_string}
						weekday_string={weekday_string}
						month_string={month_string}
						day_string={day_string}
						year_string={year_string}
						// ... pass any other props that MycroftDateTime expects
						duration={7000} // Assuming duration is a constant, otherwise get it from state
					/>
				);
			case "mycroft-ip.mycroftai":
				return <MycroftIp skillState={skill_state} componentName={component_name} />;
			case "mycroft-wiki.mycroftai":
				return <MycroftWiki skillState={skill_state} componentName={component_name} />;
			case "mycroft-weather.mycroftai":
				return <MycroftWeather skillState={skill_state} componentName={component_name} />;
			default:
				if (component_name.endsWith(".qml")) {
					const errorMsg = `ERROR: Ignoring request for ${component_name}`;
					console.error(errorMsg);
					return errorMsg;
				}
				console.log(`Loading ${component_name}`);
				try {
					let resource_name = String(component_name).substring(component_name.lastIndexOf("/") + 1);
					resource_name = resource_name.substring(0, resource_name.lastIndexOf("."));
					console.log(`Getting component: ${resource_name}`);
					let Component;
					if (resource_name.startsWith("SYSTEM")) {
						Component = system_components[resource_name];
					} else {
						Component = skill_components[resource_name];
					}
					if (Component) {
						console.log(Component);
						return <Component skillState={skill_state} componentName={component_name} />;
					} else {
						const notFoundMsg = `Component not found for ${resource_name}`;
						console.warn(notFoundMsg);
						return notFoundMsg;
					}
				} catch (e) {
					console.log(e);
					return "ERROR: Component failed to load.";
				}
		}
	}

	return returnActiveSkillComponent()
}
