"use sctrict";

var UI = require('ui');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');

var watchId;

var prevFixTime;
var prevFix;

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
  return sgn + ' ' + deg + '\xB0' + dec.toFixed(2);
};

var lpad = function(s, len, pad) {
  var str = s;
  while (str.length < len) {
    str = (pad === undefined ? ' ' : pad) + str;
  }
  return str;
};

var degToRadians = function(angle) {
  return angle * Math.PI / 180.0;
};

var radiansToDegrees = function(angle) {
  return angle * 180.0 / Math.PI;
};

/**
 * from, to: {lat: 38.85643, lon: -123.98736}, in degrees
 * Return in nautical miles
 */
var getDistance = function(from, to) {
  var cos = Math.sin(degToRadians(from.lat)) *
            Math.sin(degToRadians(to.lat)) +
            Math.cos(degToRadians(from.lat)) *
            Math.cos(degToRadians(to.lat)) * Math.cos(degToRadians(to.lon) - degToRadians(from.lon));
  var dist = Math.acos(cos);
  return radiansToDegrees(dist) * 60; // in nm
};

var dateHMS = function() {
  var d = new Date();
  return lpad(d.getHours().toString(), 2, '0') + ':' + lpad(d.getMinutes().toString(), 2, '0') + ':' + lpad(d.getSeconds().toString(), 2, '0');
};

// Called from navigator.geolocation.getCurrentPosition
var onPosSuccess = function(pos) {
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
  console.log("Pos data:" + JSON.stringify(pos));
  var speed;
  var now = new Date().getTime();
  if (prevFix !== undefined && prevFixTime !== undefined) {
    var deltaDist = getDistance(prevFix, { lat:pos.coords.latitude, lon: pos.coords.longitude });
    speed = (deltaDist * 1852) / ((now - prevFixTime) / 1000); // in m/s
  }
  prevFix = { lat:  pos.coords.latitude, lon: pos.coords.longitude };
  prevFixTime = now;
  if (main !== undefined) {
    var card = main; // new UI.Card();
    card.title('Location');
    card.subtitle('');
    card.body(formatPos(pos.coords.latitude, 'L') + '\n' +
              formatPos(pos.coords.longitude, 'G') + '\n' +
              'At ' + dateHMS() + (speed !== undefined ? '\n' +
                                             'Spd:' + (speed * 3.6).toFixed(speed < 10 ? 2 : (speed < 100? 1: 0)) + ' km/h' : ''));
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

// Choose options about the data returned
var options = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000
};

// Request current position
watchId = navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, options);

// Prepare the accelerometer
Accel.init();

main.on('accelTap', function(e) {
  console.log('Refreshing position');
  watchId = navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, options);
  Vibe.vibrate('short');
});

var interval = setInterval(function() {
  watchId = navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, options);
}, 10000);

main.on('click', 'back', function(e) {
  console.log('Main BACK');
  clearInterval(interval);
  main.hide();
});
