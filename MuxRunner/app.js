/**
 * Mux Runner client.
 */

var Settings = require('settings'); // See https://pebble.github.io/pebblejs/#settings
var UI = require('ui');
var Vector2 = require('vector2');

var resturl = Settings.option('resturl');

var HTTP_STATUS = {
	OK: 200,
	OK_NO_CONTENT: 204,
	BAD_REQUEST: 400,
	NOT_FOUND: 404,
	FORBIDDEN: 403
};

var XHR_STATUS = {
	NOT_INITIALIZED: 0,
	CONNECTION_ESTABLISHED: 1,
	REQUEST_RECEIVED: 2,
	PROCESSING_REQUEST: 3,
	FINISHED_RESPONSE_READY: 4
};

Settings.config(
		{ url: 'http://lediouris.net/pebble/MuxRunner.app.html' },
		function(e) { // OnOpen
			console.log('opening configurable:', JSON.stringify(e));
			Settings.option('resturl', resturl);
		},
		function(e) { // OnClose. If the app is running, restart it.
			resturl = Settings.option('resturl');
			console.log('closed configurable, rest url:', resturl);
			if (e.failed === true) {
				console.log("Failed:" + JSON.stringify(e));
			}
		}
);

var xhr;

if (resturl === undefined) {
	resturl = 'http://192.168.42.1:9999';
//resturl = 'http://192.168.1.170:9999';
}
console.log('Will use to ' + resturl);

var ON_OFF_RESOURCE = "/mux-process"; // GET, PUT
var RUN_DATA        = "/run-data"; // GET
var CLEAR_CACHE     = "/cache"; // DELETE

var dataCard = new UI.Card({
	body: 'Display Data!!',
	action: {
		select: 'images/action_bar_icon_delete.png'
	}
});
var interval;

var main = new UI.Card({
	title: ' Runner',
	icon: 'images/runner_23x25.png',
	subtitle: 'Log. ?',
	body: 'Up: on\nDown: off\nSelect: Display',
	action: {
		up: 'images/music_icon_play.png',
		select: 'images/music_icon_ellipsis.png',
		down: 'images/music_icon_pause.png'
	}
});

main.show();

var getLoggingStatus = function() {
	var url = resturl + ON_OFF_RESOURCE;
	console.log("Getting Log. status:", url);
	xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === XHR_STATUS.FINISHED_RESPONSE_READY && xhr.status === HTTP_STATUS.OK) {
			console.log("XHR returned", xhr.responseText);
			if (main !== undefined) {
				var card = main; // new UI.Card();
				var resp = JSON.parse(xhr.responseText);
				if (resp !== undefined && resp.processing !== undefined) {
					card.subtitle('Log. ' + (resp.processing === true ? 'ON' : 'OFF'));
					card.show();
				}
			}
		} else {
			console.log("XHR: State:", xhr.status, " RS:", xhr.readyState);
			console.log("ResponseText:", xhr.responseText);
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
	console.log("GET request has been sent");
};

/**
 *
 * @param position on or off
 */
var setLoggingStatus = function(position) {
	console.log("Setting Log. " + position);
	var url = resturl + ON_OFF_RESOURCE + '/' + position;
	xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === XHR_STATUS.FINISHED_RESPONSE_READY && xhr.status === HTTP_STATUS.OK) {
			console.log("XHR returns", xhr.responseText);
			if (main !== undefined) {
				var card = main; // new UI.Card();
				var resp = xhr.responseText.trim();
				if (resp !== undefined && resp !== undefined) {
					card.subtitle('Log. ' + (resp === 'true' ? 'ON' : 'OFF'));
					card.show();
				}
			}
		} else {
			console.log("XHR: State:", xhr.status, " RS:", xhr.readyState);
		}
	};
	xhr.open("PUT", url, true);
	xhr.send();
	console.log("Log. has been set");
};

var resetCache = function() {
	var url = resturl + CLEAR_CACHE;
	console.log("Reseting data", url);
	xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === XHR_STATUS.FINISHED_RESPONSE_READY && xhr.status === HTTP_STATUS.OK_NO_CONTENT) {
			console.log("XHR returns");
			if (dataCard !== undefined) {
				var card = dataCard;
				card.body('Cache was reset');
				card.show();
			}
		} else {
			console.log("XHR: State:", xhr.status, " RS:", xhr.readyState);
		}
	};
	xhr.open("DELETE", url, true);
	console.log("Cache reset");
};

var getRunData = function() {
	console.log("Getting run data.");
	var url = resturl + RUN_DATA;
	xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === XHR_STATUS.FINISHED_RESPONSE_READY && xhr.status === HTTP_STATUS.OK) {
			console.log("XHR returned", xhr.responseText);
			if (dataCard !== undefined) {
				var card = dataCard; // new UI.Card();
				var resp = JSON.parse(xhr.responseText);
				if (resp !== undefined && resp.dist !== undefined && resp.dist.distance !== undefined) {
					card.body('Dist:' + resp.dist.distance.toFixed(1));
					card.show();
				}
			}
		} else {
			console.log("XHR: State:", xhr.status, " RS:", xhr.readyState);
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
	console.log("GET request has been sent");
};

// Get status on startup
getLoggingStatus();

main.on('click', 'up', function(e) {
	// Turn Log ON
	setLoggingStatus('on');
});

main.on('click', 'down', function(e) {
	// Turn Log OFF
	setLoggingStatus('off');
});

main.on('click', 'select', function(e) {
	console.log('Displaying data...');
	// Loop on the run-data
	interval = setInterval(getRunData, 1000);
	// On select, reset cache
	dataCard.on('click', 'select', function(e) {
		resetCache();
	});
	dataCard.show();
});
