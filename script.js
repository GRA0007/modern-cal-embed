const ical_field = document.getElementById('ical');
const show_title_field = document.getElementById('show_title');
const show_nav_field = document.getElementById('show_nav');
const show_date_field = document.getElementById('show_date');
//const show_view_field = document.getElementById('show_view');
//const default_view_field = document.getElementById('default_view');
const color_field = document.getElementById('color');
const embed_field = document.getElementById('embed_link');
const copy_button = document.getElementById('copy_url');
const iframe = document.getElementById('iframe');

// Defaults
let ical = '';
let show_title = 1;
let show_nav = 1;
let show_date = 1;
//let show_view = 1;
//let default_view = 0;
let color = '#1A73E8';

// Reload iframe with new params
function refresh() {
	let embed = `${document.URL.substr(0,document.URL.lastIndexOf('/'))}/iframe.html?ical=${encodeURIComponent(ical)}&title=${show_title}&nav=${show_nav}&date=${show_date}&color=${encodeURIComponent(color)}`;
	embed_field.value = embed;
	iframe.src = embed;
}

ical_field.addEventListener('change', () => {
	ical = ical_field.value;
	refresh();
});

show_title_field.addEventListener('change', () => {
	show_title = show_title_field.checked ? 1 : 0;
	refresh();
});

show_nav_field.addEventListener('change', () => {
	show_nav = show_nav_field.checked ? 1 : 0;
	refresh();
});

show_date_field.addEventListener('change', () => {
	show_date = show_date_field.checked ? 1 : 0;
	refresh();
});

/*show_view_field.addEventListener('change', () => {
	show_view = show_view_field.checked ? 1 : 0;
	refresh();
});*/

color_field.addEventListener('change', () => {
	color = color_field.value;
	refresh();
});

/*default_view_field.addEventListener('change', () => {
	default_view = default_view_field.value;
	refresh();
});*/

copy_button.addEventListener('click', () => {
	embed_field.select();
	embed_field.setSelectionRange(0, 99999);
	document.execCommand("copy");
	copy_button.innerHTML = 'Copied!';
	window.setTimeout(() => {
		copy_button.innerHTML = 'Copy';
	}, 1000);
});

refresh();
