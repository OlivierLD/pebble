"use sctrict";

var UI = require('ui');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');

var watchId;

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

var dateHMS = function() {
  var d = new Date();
  return lpad(d.getHours().toString(), 2, '0') + ':' + lpad(d.getMinutes().toString(), 2, '0') + ':' + lpad(d.getSeconds().toString(), 2, '0');
};

// Called from navigator.geolocation.getCurrentPosition
var onPosSuccess = function(pos) {
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
  console.log("Pos data:" + JSON.stringify(pos));
  if (main !== undefined) {
    var card = main; // new UI.Card();
    card.title('Location');
    card.subtitle('');
    card.body(formatPos(pos.coords.latitude, 'L') + '\n' + formatPos(pos.coords.longitude, 'G') + '\nRefreshed at ' + dateHMS());
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

