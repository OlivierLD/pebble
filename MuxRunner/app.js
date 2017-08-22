/**
 * Mux Runner client.
 */

var Settings = require('settings'); // See https://pebble.github.io/pebblejs/#settings
var UI = require('ui');
var Vector2 = require('vector2');

var resturl = Settings.option('resturl');

var HTTP_STATUS = {
  OK: 200,
  OK_NO_CONTENT: 201,
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
        // Reset wsuri before opening the webview
//      Settings.option({wsuri: wsURI});
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
}
console.log('Connecting to ' + resturl);

var ON_OFF_RESOURCE = "/mux-process"; // GET, PUT

var main = new UI.Card({
  title: ' Runner',
  icon: 'images/runner_23x25.png',
  subtitle: 'Logging ?',
  body: /*'Ping ' + resturl + '.\n' + */ 'Up: on\nDown: off\nSelect: Display',
  action: {
    up: 'images/action_bar_icon_check.png',
    select: 'images/music_icon_play.png',
    down: 'images/action_bar_icon_dismiss.png'
  }
});

main.show();

var getLoggingStatus = function() {
    console.log("Getting logging status.");
    var url = resturl + ON_OFF_RESOURCE;
    xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XHR_STATUS.FINISHED_RESPONSE_READY && xhr.status === HTTP_STATUS.OK) {
            console.log("XHR returned", xhr.responseText);
            if (main !== undefined) {
                var card = main; // new UI.Card();
                var resp = JSON.parse(xhr.responseText);
                if (resp !== undefined && resp.value !== undefined) {
                    card.subtitle('Logging is ' + resp.value);
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

/**
 *
 * @param position on or off
 */
var setLoggingStatus = function(position) {
    console.log("Setting logging " + position);
    var url = resturl + ON_OFF_RESOURCE + '/' + position;
    xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XHR_STATUS.FINISHED_RESPONSE_READY && xhr.status === HTTP_STATUS.OK) {
            console.log("XHR returns", xhr.responseText);
            if (main !== undefined) {
                var card = main; // new UI.Card();
                var resp = JSON.parse(xhr.responseText);
                if (resp !== undefined && resp.value !== undefined) {
                    card.subtitle('Logging ' + resp.value);
                    card.show();
                }
            }
        } else {
            console.log("XHR: State:", xhr.status, " RS:", xhr.readyState);
        }
    };
    xhr.open("PUT", url, true);
    // xhr.setRequestHeader("Content-type", "application/json");
    // xhr.setRequestHeader("X-AIO-Key", key);
    // var data = { "value": position };
    xhr.send(); // JSON.stringify(data));
    console.log("Logging has been set");
};

// Get status on startup
getLoggingStatus();

main.on('click', 'up', function(e) {
  // Turn logging ON
  setLoggingStatus('on');
});

main.on('click', 'down', function(e) {
    // Turn logging OFF
    setLoggingStatus('off');
});

main.on('click', 'select', function(e) {
  // TODO Go to display data

  var wind = new UI.Window({
    backgroundColor: 'black'
  });
  var radial = new UI.Radial({
    size: new Vector2(140, 140),
    angle: 0,
    angle2: 300,
    radius: 20,
    backgroundColor: 'cyan',
    borderColor: 'celeste',
    borderWidth: 1,
  });
  var textfield = new UI.Text({
    size: new Vector2(140, 60),
    font: 'gothic-24-bold',
    text: 'Dynamic\nWindow',
    textAlign: 'center'
  });
  var windSize = wind.size();
  // Center the radial in the window
  var radialPos = radial.position()
      .addSelf(windSize)
      .subSelf(radial.size())
      .multiplyScalar(0.5);
  radial.position(radialPos);
  // Center the textfield in the window
  var textfieldPos = textfield.position()
      .addSelf(windSize)
      .subSelf(textfield.size())
      .multiplyScalar(0.5);
  textfield.position(textfieldPos);
  wind.add(radial);
  wind.add(textfield);
  wind.show();
});
