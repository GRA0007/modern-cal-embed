const AGENDA_DAYS = 20;
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let ampm = (h) => (h < 12 || h === 24) ? "am" : "pm";

const url = new URL(window.location.href);
const loading = document.getElementById('loading');

const ical = url.searchParams.get('ical');
let show_title = url.searchParams.get('title') || 1;
const show_nav = url.searchParams.get('nav') || 1;
const show_date = url.searchParams.get('date') || 1;
const show_details = url.searchParams.get('details') || 0;
const show_view = url.searchParams.get('view') || 1;
const default_view = url.searchParams.get('dview') || 0;
const color = url.searchParams.get('color') || '#1A73E8';
const colorBG = url.searchParams.get('colorbg') || '#FFFFFF';
const colorText = url.searchParams.get('colortxt') || '#000000';
const colorThemeText = url.searchParams.get('colorsecondarytxt') || '#FFFFFF';

let today = new Date();
today.setHours(0,0,0,0);
let selectedDay = new Date(today.valueOf());

function getHumanDate(date) {
	return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,0)}-${date.getDate().toString().padStart(2,0)}`;
}

function createDateCell(date, todayd = false) {
	let day = date.getDay();
	let dateM = date.getDate();
	let month = date.getMonth();
	let dateCell = document.createElement('td');
	dateCell.tabIndex = '-1';
	dateCell.dataset.date = getHumanDate(date);
	dateCell.onfocus = () => {
		selectDay(getHumanDate(date), false)
	};
	if (todayd) {
		dateCell.className = 'today';
	}
	let dayEl = document.createElement('span');
	dayEl.className = 'dayname';
	dayEl.appendChild(document.createTextNode(DAYS_OF_WEEK[day].substring(0,3).toUpperCase()));
	dateCell.appendChild(dayEl);
	let dateEl = document.createElement('span');
	dateEl.className = 'day';
	let dateSpan = document.createElement('span');
	dateSpan.appendChild(document.createTextNode(dateM));
	dateEl.appendChild(dateSpan);
	dateCell.appendChild(dateEl);
	let monthEl = document.createElement('span');
	monthEl.className = 'month';
	monthEl.appendChild(document.createTextNode(MONTHS[month].substring(0,3).toUpperCase()));
	dateCell.appendChild(monthEl);
	return dateCell;
}

function selectDay(date, focus = true) {
	selectedDay = new Date(date + 'T00:00');

	document.querySelector('#date_label span').innerHTML = `${DAYS_OF_WEEK[selectedDay.getDay()]}, ${MONTHS[selectedDay.getMonth()]} ${selectedDay.getDate()}`;
	document.getElementById('date').value = getHumanDate(selectedDay);

	let selectedElement = document.querySelector(`#agenda td[data-date='${getHumanDate(selectedDay)}']`);
	if (selectedElement && focus) {
		selectedElement.focus();
	}
}

function renderCalendar(meta, events) {
	// Title
	if (show_title == 1) {
		show_title = meta.calname != null;
	}
	if (show_title == 1) {
		document.getElementById('title').innerHTML = meta.calname;
	} else {
		document.getElementById('title').style.display = 'none';
	}

	// Nav
	let btn_today = document.getElementById('btn_today');
	let arrows = document.getElementById('arrows');
	btn_today.onclick = () => {
		// Scroll to today
		//document.querySelector('#agenda td.today').scrollIntoView(false);
		selectDay(getHumanDate(today));
	};
	document.getElementById('btn_prev').onclick = () => {
		let prevDay = new Date(selectedDay.valueOf());
		prevDay.setDate(prevDay.getDate() - 1);
		selectDay(getHumanDate(prevDay));
	};
	document.getElementById('btn_next').onclick = () => {
		let prevDay = new Date(selectedDay.valueOf());
		prevDay.setDate(prevDay.getDate() + 1);
		selectDay(getHumanDate(prevDay));
	};
	if (show_nav == 0) {
		btn_today.style.display = 'none';
		arrows.style.display = 'none';
	}

	// Sort events
	events.sort((a,b) =>  a.startDate - b.startDate);
	// Filter after today
	events = events.filter((e) => {
		let end = new Date(e.endDate.valueOf());
		end.setHours(0,0,0,0);
		return end >= today;
	});

	// Date
	let date_label = document.getElementById('date_label');
	let date_input = document.getElementById('date');
	document.querySelector('#date_label span').innerHTML = `${DAYS_OF_WEEK[selectedDay.getDay()]}, ${MONTHS[selectedDay.getMonth()]} ${selectedDay.getDate()}`;
	date_input.value = getHumanDate(selectedDay);
	date_input.onchange = () => {
		selectDay(date_input.value);
	};
	if (show_date == 0) {
		date_label.style.display = 'none';
	}

	// Remove nav element
	if (show_title == 0 && show_nav == 0 && show_date == 0) {
		document.getElementById('top').style.display = 'none';
	}

	// Colors
	document.documentElement.style.setProperty('--theme-color', color);
	document.documentElement.style.setProperty('--text-color', colorText);
	document.documentElement.style.setProperty('--background-color', colorBG);
	document.documentElement.style.setProperty('--theme-text-color', colorThemeText);

	// Create elements
	let days = [];
	let row;
	let column;
	let prevDay = null;
	let indicator = document.createElement('div');
	indicator.className = 'indicator';
	let nowDate = new Date();
	let now = `${(nowDate.getHours() % 12) || 12}:${nowDate.getMinutes() < 10 ? '0' : ''}${nowDate.getMinutes()}`;
	let nowM = ampm(nowDate.getHours());
	indicator.title = `${now} ${nowM}`;
	let indicatorset = false;
	let todayHasEvents = false;
	for (let i = 0; i < (events.length < AGENDA_DAYS ? events.length : AGENDA_DAYS); i++) {
		let tomorrow = new Date(today.valueOf());
		tomorrow.setDate(tomorrow.getDate() + 1);
		if (events[i].startDate > tomorrow && !todayHasEvents) {
			todayHasEvents = true;
			row = document.createElement('tr');
			row.appendChild(createDateCell(
				events[i].startDate,
				true
			));
			column = document.createElement('td');
			column.className = 'emptyday';
			column.appendChild(document.createTextNode('No events today'));
			row.appendChild(column);
			days.push(row);
		}
		if (prevDay != events[i].startDate.toDateString()) {
			prevDay = events[i].startDate.toDateString();
			row = document.createElement('tr');

			let curDay = new Date(events[i].startDate.valueOf());
			curDay.setHours(0,0,0,0);
			if (curDay.getTime() == today.getTime()) {
				todayHasEvents = true;
			}

			row.appendChild(createDateCell(
				events[i].startDate,
				curDay.getTime() == today.getTime()
			));
			column = document.createElement('td');
		}

		// Indicator
		let eventDay = new Date(events[i].endDate.valueOf());
		eventDay.setHours(0,0,0,0);
		if (nowDate < events[i].endDate && !indicatorset && today.getTime() == eventDay.getTime()) {
			column.appendChild(indicator);
			indicatorset = true;
		}

		let event = document.createElement('div');
		event.className = 'event';

		let summary = document.createElement('div');
		summary.className = 'summary';
		if (show_details == 0) {
			summary.tabIndex = '0';
			summary.onkeypress = (e) => {
				if (e.keyCode === 13) {
					event.classList.toggle('open');
				}
			};
			summary.onclick = () => event.classList.toggle('open');
		} else {
			event.className = 'event open always';
		}

		let eName = document.createElement('span');
		eName.className = 'name';
		eName.appendChild(document.createTextNode(events[i].name));
		summary.appendChild(eName);

		let startTime = `${(events[i].startDate.getHours() % 12) || 12}:${events[i].startDate.getMinutes() < 10 ? '0' : ''}${events[i].startDate.getMinutes()}`;
		let endTime = `${(events[i].endDate.getHours() % 12) || 12}:${events[i].endDate.getMinutes() < 10 ? '0' : ''}${events[i].endDate.getMinutes()}`;
		let startM = ampm(events[i].startDate.getHours());
		let endM = ampm(events[i].endDate.getHours());

		if (!events[i].allDay) {
			let eTime = document.createElement('span');
			eTime.className = 'time';
			let timeText = `${startTime} ${startM == endM ? '' : startM} - ${endTime} ${endM}`;
			if (events[i].days === 0) {
				timeText = `${startTime} ${startM}`;
			} else if (events[i].days > 1 && !events[i].allDay) {
				timeText = `${MONTHS[events[i].startDate.getMonth()]} ${events[i].startDate.getDate()}, ${startTime}${startM} - ${MONTHS[events[i].endDate.getMonth()]} ${events[i].endDate.getDate()}, ${endTime}${endM}`;
			}
			eTime.appendChild(document.createTextNode(timeText));
			summary.appendChild(eTime);
		}
		event.appendChild(summary);

		let eDetails = document.createElement('div');
		eDetails.className = 'details';

		let whenLabel = document.createElement('strong');
		whenLabel.appendChild(document.createTextNode('When: '));
		let when = document.createElement('span');
		when.className = 'when';
		let whenText = `${DAYS_OF_WEEK[events[i].startDate.getDay()].substring(0,3)}, ${MONTHS[events[i].startDate.getMonth()]} ${events[i].startDate.getDate()}, ${startTime}${startM} - ${endTime}${endM}`;
		if (events[i].days == 1 && events[i].allDay) {
			whenText = `${DAYS_OF_WEEK[events[i].startDate.getDay()]}, ${MONTHS[events[i].startDate.getMonth()].substring(0,3)} ${events[i].startDate.getDate()}, ${events[i].startDate.getFullYear()}`;
		} else if (events[i].days % 1 == 0 && events[i].allDay) {
			let newEnd = new Date(events[i].endDate.valueOf());
			newEnd.setDate(newEnd.getDate()-1);
			whenText = `${MONTHS[events[i].startDate.getMonth()].substring(0,3)} ${events[i].startDate.getDate()} - ${MONTHS[newEnd.getMonth()].substring(0,3)} ${newEnd.getDate()}, ${events[i].startDate.getFullYear()}`;
		} else if (events[i].days > 1) {
			whenText = `${MONTHS[events[i].startDate.getMonth()]} ${events[i].startDate.getDate()}, ${startTime}${startM} - ${MONTHS[events[i].endDate.getMonth()]} ${events[i].endDate.getDate()}, ${endTime}${endM}`;
		}
		when.appendChild(document.createTextNode(whenText));
		eDetails.appendChild(whenLabel);
		eDetails.appendChild(when);

		if (events[i].location != '') {
			eDetails.appendChild(document.createElement('br'));
			let whereLabel = document.createElement('strong');
			whereLabel.appendChild(document.createTextNode('Where: '));
			let where = document.createElement('span');
			where.className = 'where';
			let whereText = document.createTextNode(events[i].location);
			if (events[i].location.startsWith('http')) {
			 	whereText = document.createElement('a');
				whereText.href = events[i].location;
				whereText.target = '_blank';
				whereText.appendChild(document.createTextNode(events[i].location));
			}
			where.appendChild(whereText);
			eDetails.appendChild(whereLabel);
			eDetails.appendChild(where);
		}

		if (events[i].description != '') {
			eDetails.appendChild(document.createElement('br'));
			let descLabel = document.createElement('strong');
			descLabel.appendChild(document.createTextNode('Description: '));
			let desc = document.createElement('span');
			desc.className = 'description';
			desc.innerHTML = events[i].description;
			eDetails.appendChild(descLabel);
			eDetails.appendChild(desc);
		}

		event.appendChild(eDetails);

		column.appendChild(event);

		if (events[i].endDate < nowDate && today.getTime() == eventDay.getTime()) {
			column.appendChild(indicator);
		}

		if (i+1 == events.length || events[i].startDate.toDateString() != events[i+1].startDate.toDateString()) {
			row.appendChild(column);
			days.push(row);
		}
	}

	let agenda = document.getElementById('agenda');
	agenda.innerHTML = '';
	for (let i = 0; i < days.length; i++) {
		agenda.appendChild(days[i]);
	}

	// Empty state
	if (events.length == 0) {
		let emptystate = document.createElement('tr');
		emptystate.id = 'emptystate';
		let emptydata = document.createElement('td');
		emptydata.appendChild(document.createTextNode('No upcoming events'));
		emptystate.appendChild(emptydata);
		agenda.appendChild(emptystate);
	}

	loading.style.display = 'none';
}

function parseCalendar(data) {
	let jCal = ICAL.parse(data);
	let comp = new ICAL.Component(jCal);

	const meta = {
		calname: comp.getFirstPropertyValue('x-wr-calname'),
		timezone: new ICAL.Timezone(comp.getFirstSubcomponent('vtimezone')).tzid,
		caldesc: comp.getFirstPropertyValue('x-wr-caldesc')
	};

	let eventData = comp.getAllSubcomponents('vevent');
	let events = [];

	// Copy event data to custom array
	for (let i = 0; i < eventData.length; i++) {
		let event = new ICAL.Event(eventData[i]);
		let duration = event.endDate.subtractDate(event.startDate);
		events.push({
			uid: event.uid,
			name: event.summary,
			location: event.location,
			description: event.description,
			startDate: event.startDate.toJSDate(),
			endDate: event.endDate.toJSDate(),
			allDay: event.startDate.isDate,
			days: (duration.toSeconds()/86400)
		});
		if (event.isRecurring()) {
			let expand = new ICAL.RecurExpansion({
				component: eventData[i],
				dtstart: event.startDate
			});

			let j = 0;
			let next;
			while (j < 10 && (next = expand.next())) {
				if (j > 0) {
					let endDate = next.clone();
					endDate.addDuration(duration);
					events.push({
						uid: event.uid,
						name: event.summary,
						location: event.location,
						description: event.description,
						startDate: next.toJSDate(),
						endDate: endDate.toJSDate(),
						allDay: event.startDate.isDate,
						days: (duration.toSeconds()/86400)
					});
				}
				j++;
			}
		}
	}
	renderCalendar(meta, events);
}

if (ical) {
	fetch(ical).then((response) => {
		response.text().then((text) => {
			parseCalendar(text);
		});
	}).catch((e) => {
		console.error(e);
		loading.innerHTML = "Error: iCal URL doesn't exist or isn't valid<br><br>iCal links (like those from Google calendar) will need to use a cors proxy";
	});
} else {
	loading.innerHTML = "Error: no iCal URL provided";
}
