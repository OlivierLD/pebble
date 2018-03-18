/**
 * Interaction with a specific REST URL
 * GET Weather Data
 *
 * Sample weather data:
 * {
 *   "type":"ALL",
 *   "period":"LAST",
 *   "query":"SELECT log_time, dew, FORMAT(wdir, 0) as wdir, FORMAT(wgust, 2) as wgust, FORMAT(wspeed, 2) as wspeed, rain, press / 100 as press, atemp, hum FROM weather_data WHERE log_time = (SELECT MAX(log_time) FROM weather_data) ORDER BY log_time ASC ",
 *   "data":[
 *     { "time": "2018-03-18 15:21:17",
 *       "wdir": 71,
 *       "gust":4.93,
 *       "ws":4.37,
 *       "rain":0.000,
 *       "press":1020.1100000,
 *       "atemp":10.200,
 *       "hum":70.057,
 *       "dew":5.000
 *     }
 *   ]
 * }
 */

var UI = require('ui');

var xhr;

var URL = "http://donpedro.lediouris.net/php/weather/reports.v2/json.data.php?type=ALL&period=LAST";

var main = new UI.Card({
	title: ' Click!',
	icon: 'images/cloud.png',
	body: 'Select to Refresh',
	subtitleColor: 'indigo', // Named colors
	bodyColor: '#9a0036', // Hex colors
	action: {
		select: 'images/music_icon_play.png'
	}
});

main.show();

// New data window for the weather data
var dataCard = new UI.Card({
	backgroundColor: 'white',
	body: 'Placeholder'
});

/**
 * Sample data:
 *     { "time": "2018-03-18 15:21:17",
 *       "wdir": 71,
 *       "gust":4.93,
 *       "ws":4.37,
 *       "rain":0.000,
 *       "press":1020.1100000,
 *       "atemp":10.200,
 *       "hum":70.057,
 *       "dew":5.000 }
 *
 * @param data
 */
var setData = function(data) {
	var dataString =
			'At ' + data.time.split(' ')[1] + ' UT\n' +
			'W:' + data.ws + 'kts, ' + data.wdir + '°\n' +
	    'T:' + data.atemp.toFixed(1) + '°C,D:' + data.dew.toFixed(1) + '°C\n' +
			'Pr:' + data.press.toFixed(1) + ' hPa\n' +
			'Hum:' + data.hum.toFixed(1) + '%\n' +
			'Rain:' + data.rain.toFixed(2) + 'mm/h';
//console.log('Composed:' + dataString);
	return dataString;
};

var downloadData = function() {
	var url = URL;
	xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
//		console.log("XHR returns", xhr.responseText);
			if (main !== undefined) {
				var card = main; // new UI.Card();
				var resp = JSON.parse(xhr.responseText);
				if (resp !== undefined && resp.data !== undefined && resp.data.length > 0) {
					if (dataCard !== undefined) {
						var weatherDataCard = dataCard; // new UI.Card();
						weatherDataCard.body(setData(resp.data[0]));
						weatherDataCard.show();
					} else {
						card.body(JSON.stringify(resp.data[0])); // raw json
						card.show();
					}
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
	console.log("Weather data was requested");
};

main.on('click', 'select', function(e) {
	downloadData();
});

main.on('click', 'up', function(e) {
	console.log("Do nothing");
});

main.on('click', 'down', function(e) {
	console.log("Do nothing");
});
