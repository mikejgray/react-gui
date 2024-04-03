import React from "react";
import { ContentElement } from "../core_components/utils";

const SanitizedMonth = (props) => {
	console.log("Props in SanitizedMonth:", props);
	let [month, day] = [props.month_string, props.day_string];
	console.log("Month and Day in SanitizedMonth:", { month, day });
	return (
		(month && day && day.length > 0 && month.includes(day))
			? month.replace(` ${day}`, '')
			: month
	)
}

const HumanizedDateTime = (props) => {
	console.log("Props in HumanizedDateTime:", props);
	const { month_string, day_string, year_string, time_string, ampm_string, date_string, duration } = props;
	console.log("Destructured Props:", { month_string, day_string, year_string, time_string, ampm_string, date_string, duration });
	const month = SanitizedMonth({ month_string, day_string });
	console.log("Month after SanitizedMonth call:", month);

	let humanizedDateText = month && day_string && year_string ? `${month}, ${day_string}, ${date_string.split('/')[-1]}` :
		month && day_string ? `${month}, ${day_string}` :
			month ? month :
				null;

	return (
		humanizedDateText ?
			<div className="row">
				<ContentElement
					elementType={"TextFrame"}
					id={"fullTimeString"}
					className={"col-12 h3"}
					text={humanizedDateText}
					duration={duration}
				/>
			</div> : null
	);
}

export const MycroftDateTime = ({
	time_string,
	date_string,
	ampm_string,
	weekday_string,
	month_string,
	day_string,
	year_string,
	duration = 7000
}) => {
	return (
		<div className="v-aligned-container row text-center">
			<ContentElement
				elementType={"Overlay"}
				duration={duration}
			/>
			<div className="col-12">
				<ContentElement
					elementType={"TextFrame"}
					id={"timeString"}
					className={"col-12 h1"}
					text={time_string}
					duration={duration}
				/>
				<ContentElement
					elementType={"TextFrame"}
					id={"dateString"}
					className={"col-12 h4"}
					text={date_string}
					duration={duration}
				/>
				<ContentElement
					elementType={"TextFrame"}
					id={"weekDayString"}
					className={"col-12 h2"}
					text={weekday_string}
					duration={duration}
				/>
				<HumanizedDateTime
					month_string={month_string}
					day_string={day_string}
					year_string={year_string}
					date_string={date_string}
					duration={duration}
				/>
			</div>
		</div>
	);
}