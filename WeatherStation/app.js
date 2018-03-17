/**
 * Interaction with a specific REST URL
 * GET Weather Data
 */

var UI = require('ui');

var xhr;

var URL = "http://donpedro.lediouris.net/php/weather/reports.v2/json.data.php?type=ALL&period=LAST";

var main = new UI.Card({
	title: ' Click!',
	icon: 'images/cloud.png',
	body: 'Up or Down: Refresh',
	subtitleColor: 'indigo', // Named colors
	bodyColor: '#9a0036', // Hex colors
	action: {
		up: 'images/action_bar_icon_check.png',
		down: 'images/action_bar_icon_dismiss.png'
	}
});

main.show();

var downloadData = function() {
	var url = URL;
	xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			console.log("XHR returns", xhr.responseText);
			if (main !== undefined) {
				var card = main; // new UI.Card();
				var resp = JSON.parse(xhr.responseText);
				if (resp !== undefined && resp.data !== undefined && resp.data.length > 0) {
					card.body(JSON.stringify(resp.data[0])); // TODO a better UI ;)
					card.show();
				} else {
					console.log(JSON.stringify(resp, null, 2));
				}
			}
		} else {
			console.log("XHR: State:", xhr.status, " RS:", xhr.readyState);
		}
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send();
	console.log("Weather was requested");
};

main.on('click', 'select', function(e) {
	console.log("Do nothing");
});

main.on('click', 'up', function(e) {
	downloadData();
});

main.on('click', 'down', function(e) {
	downloadData();
});
