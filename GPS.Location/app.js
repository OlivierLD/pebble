"use sctrict";

var Settings = require('settings'); // See https://pebble.github.io/pebblejs/#settings
var UI = require('ui');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');

var watchId;
var interval;

var MS  = "ms";
var MPH = "mph";
var KMH = "kmh";

var speedUnit   = Settings.option('speedunit');
var refreshRate = Settings.option('refreshrate');

// Choose options about the data returned
var options = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

var bounce = function() {
  if (interval !== undefined) {
    console.log('Reseting the loop.');
    clearInterval(interval);
  }
  console.log('Starting new loop.');
  interval = setInterval(function() {
    watchId = navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, options);
  }, refreshRate * 1000);
};

if (speedUnit === undefined) {
  speedUnit   = MS;
}
if (refreshRate === undefined) {
  refreshRate = 10; // in seconds
}

var main = new UI.Card({
  title: 'Connected',
  icon: 'images/menu_icon.png',
  subtitle: 'Waiting for GPS...',
  body: 'Shake to Refresh',
  scrollable: true
});
main.show();

var formatPos = function(coord, type) {
  var n = coord;
  var sgn = (type === 'L' ? 'N' : 'E');
  if (n < 0) {
    n = -n;
    sgn = (type === 'L' ? 'S' : 'W');
  }
  var deg = Math.floor(n);
  var dec = (n - deg) * 60;
  return sgn + ' ' + deg + '\xB0' + dec.toFixed(2) + "'";
};

var lpad = function(s, len, pad) {
  var str = s;
  while (str.length < len) {
    str = (pad === undefined ? ' ' : pad) + str;
  }
  return str;
};

var dateHMS = function() {
  var d = new Date();
  return lpad(d.getHours().toString(), 2, '0') + ':' + lpad(d.getMinutes().toString(), 2, '0') + ':' + lpad(d.getSeconds().toString(), 2, '0');
};

// Called from navigator.geolocation.getCurrentPosition
var onPosSuccess = function(pos) {
//console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
//console.log('hdg= ' + pos.coords.heading + ' spd= ' + pos.coords.speed + ' m/s');
//console.log("Pos data:" + JSON.stringify(pos)); // prints nothing...
  if (main !== undefined) {
    var card = main; // new UI.Card();
    card.icon(null);
    card.title('At ' + dateHMS());
    card.subtitle('');
    var speed = pos.coords.speed;
    var hdg = pos.coords.heading;
    if (speed !== null) {
      if (speedUnit === KMH) {
        speed *= 3.6;
      } else if (speedUnit === MPH) {
        speed *= 2.2374145432;
      }
    }
    card.body(formatPos(pos.coords.latitude, 'L') + '\n' +
              formatPos(pos.coords.longitude, 'G') + '\n' +
              'Speed:' + (speed !== null ? (speed.toFixed(speed < 10 ? 2 : (speed < 100? 1: 0))):' -') + ' ' + speedUnit + '\n' +
              'Heading:' + (hdg !== null ? lpad(hdg + '\xB0', 4, '0') : ' - '));
    card.show();
  }
  if (watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId); // Stop receiving data
  }
};

// Called from navigator.geolocation.getCurrentPosition
var onPosError = function(err) {
  if (err.code == err.PERMISSION_DENIED) {
    console.log('Location access was denied by the user.');
  } else {
    console.log('location error (' + err.code + '): ' + err.message);
  }
  if (main !== undefined) {
    var card = main; // new UI.Card();
    card.title('Error');
    card.subtitle('');
    if (err.code == err.PERMISSION_DENIED) {
      card.body('Location access was denied by the user.');
    } else {
      card.body('location error (' + err.code + '): ' + err.message);
    }
    card.show();
  }
};

Settings.config(
  { url: 'http://lediouris.net/pebble/GPS.Location.html' },
  function(e) { // OnOpen
    console.log('opening configurable:', JSON.stringify(e));
    // Reset wsuri before opening the webview
    Settings.option('speedunit', speedUnit);
    Settings.option('refreshrate', refreshRate);
  },
  function(e) { // OnClose. If the app is running, restart it.
    speedUnit = Settings.option('speedunit');
    refreshRate = Settings.option('refreshrate');
    console.log('closed configurable, SpeedUnit:' + speedUnit + ", RefreshRate:" + refreshRate);
    bounce();
    if (e.failed === true) {
      console.log("Failed:" + JSON.stringify(e));
    }
  }
);

// Request current position
watchId = navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, options);

// Prepare the accelerometer
Accel.init();

main.on('accelTap', function(e) {
  console.log('Refreshing position');
  watchId = navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, options);
  Vibe.vibrate('short');
});

main.on('click', 'back', function(e) {
  console.log('Main BACK');
  clearInterval(interval);
  if (watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId); // Stop receiving data
  }
  main.hide();
});

bounce();
