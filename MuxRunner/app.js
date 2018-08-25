/**
 * Mux Runner Pebble client.
 * Pure REST/XHR
 */

var Settings = require('settings'); // See https://pebble.github.io/pebblejs/#settings
var UI = require('ui');
// var Vector2 = require('vector2');

var resturl = Settings.option('resturl');
var units = Settings.option('units'); // One of 'ms', 'mph', 'kmh', 'kts'.

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

/*
 * fromKts   : factor to apply (multiply) from knots to the required speed unit
 * fromNm    : factor to apply (multiply) from nautical miles to the required distance unit
 * fromMeters: factor to apply (multiply) from meters to the required altitude unit
 */
var UNITS = [
	{ name: "ms",
		label: "m/s and meters",
		speedUnit: "m/s",
		distUnit: "m",
		altUnit: "m",
		fromKts:  1.852 * (1000 / 3600),
		fromNM: 1852,
		fromMeters: 1 },
	{ name: "mph",
		label: "mph, statute miles and feet",
		speedUnit: "mph",
		distUnit: "sm",
		altUnit: "ft",
		fromKts: 1.15078,
		fromNM: 1.15078,
		fromMeters: 3.28084 },
	{ name: "kmh",
		label: "km/h, km and meters",
		speedUnit: "kmh",
		distUnit: "km",
		altUnit: "m",
		fromKts: 1.852,
		fromNM: 1.852,
		fromMeters: 1 },
	{ name: "kts",
		label: "knots, nautical miles and meters",
		speedUnit: "kts",
		distUnit: "nm",
		altUnit: "m",
		fromKts: 1,
		fromNM: 1,
		fromMeters: 1 }
];

var unitsMagicWand;
var xhr;
var interval;

Settings.config(
		{ url: 'http://lediouris.net/pebble/MuxRunner.app.html' },
		function(e) { // OnOpen
			console.log('opening configurable:', JSON.stringify(e));
			Settings.option('resturl', resturl);
			Settings.option('units', units);
		},
		function(e) { // OnClose. If the app is running, restart it.
			resturl = Settings.option('resturl');
			units = Settings.option('units');
			console.log('closed configurable, rest url:', resturl, ", units:", units);
			if (e.failed === true) {
				console.log("Failed:" + JSON.stringify(e));
			}
		}
);

/*
 * Define the App's cards
 */
// body: 'Display Data in ' + unitsMagicWand.speedUnit + ", " + unitsMagicWand.distUnit + " and " + unitsMagicWand.altUnit,
var dataCard = new UI.Card({
	body: 'Display Data...', // Speed, Distance since reset, altitude
	action: {
		select: 'images/action_bar_icon_delete.png',
		down: 'images/action_bar_icon_dismiss.png'
	}
});

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

if (resturl === undefined) {
//resturl = 'http://192.168.42.1:9999';
	resturl = 'http://192.168.1.170:9999';
}
console.log('Will use to ' + resturl);

if (units === undefined) {
	units = "kmh"; // default
}
for (var i=0; i<UNITS.length; i++) {
	if (UNITS[i].name === units) {
		unitsMagicWand = UNITS[i];
		break;
	}
}

var ON_OFF_RESOURCE = "/mux-process"; // GET, PUT
var RUN_DATA        = "/run-data";    // GET
var CLEAR_CACHE     = "/cache";       // DELETE

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
	console.log("Logging has been set");
};

var resetCache = function() {
	var url = resturl + CLEAR_CACHE;
	console.log(">> In resetCache", url);
	// Stop the ping
	if (interval !== undefined) {
		console.log("Clearing interval");
		interval = clearInterval(interval);
	}
	console.log('Re-creating XHR for %s...', url);
	xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === XHR_STATUS.FINISHED_RESPONSE_READY) { //  && xhr.status === HTTP_STATUS.OK_NO_CONTENT) {
			console.log("XHR returns");
			if (dataCard !== undefined) {
				var card = dataCard;
				card.body('Cache was reset');
				card.show();
				// Restart the ping
				interval = setInterval(getRunData, 1000);
			} else {
				console.log(">> resetCache: no dataCard.");
			}
		} else {
			console.log("ResetCache XHR: status:%d, readyState:%d", xhr.status, xhr.readyState);
		}
	};
	xhr.open("DELETE", url, true);
	xhr.send();
	console.log("Cache reset request sent");
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
				/*
				 * ResponseText should look like this:
				 * { "alt": { "altitude": 474.6, "delta-altitude": 476.8, "unit": "m" },
				 *   "dist": { "distance": 0.4534782901001078, "unit": "nm" },
				 *   "started": 1503501914280,
				 *   "sog": { "sog": 1.5, "unit": "kt" },
				 *   "cog": { "cog": 235, "unit": "deg" } }
				 */
				var resp = JSON.parse(xhr.responseText);
				if (resp !== undefined) {
					var display = "";
					// Distance
					if (resp.dist !== undefined && resp.dist.distance !== undefined) {
						display += ("Distance:\n" + (resp.dist.distance * unitsMagicWand.fromNM).toFixed(3) + " " + unitsMagicWand.distUnit);
					}
					// Speed
					if (resp.sog !== undefined && resp.sog.sog !== undefined) {
						display += ((display.length > 0 ? "\n" : "") + "Speed:\n" + (resp.sog.sog * unitsMagicWand.fromKts).toFixed(1) + " " + unitsMagicWand.speedUnit);
					}
					// Delta Alt
					if (resp.alt !== undefined && resp.alt["delta-altitude"] !== undefined) {
						display += ((display.length > 0 ? "\n" : "") + "Delta Alt:\n" + (resp.alt["delta-altitude"] * unitsMagicWand.fromMeters).toFixed(1) + " " + unitsMagicWand.altUnit);
					}
					card.body(display);
//				card.show();
				}
			}
		} else {
			console.log("XHR: status:", xhr.status, " readyState:", xhr.readyState);
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
	console.log("GET request has been sent");
};

// On select, reset cache
dataCard.on('click', 'select', function(e) {
	console.log("Reseting data...");
	resetCache();
});

dataCard.on('click', 'down', function(e) {
	console.log("Stop the display...");
	if (interval !== undefined) {
		interval = clearInterval(interval);
	}
});

main.show();

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
	if (dataCard !== undefined) {
		dataCard.body('Display Data in ' + unitsMagicWand.speedUnit + ", " + unitsMagicWand.distUnit + " and " + unitsMagicWand.altUnit);
	}
	// Loop on the run-data
	interval = setInterval(getRunData, 1000);
	// getRunData();
	dataCard.show();
});
