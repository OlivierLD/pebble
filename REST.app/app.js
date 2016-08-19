/**
 * Interaction with an Adafruit-IO feed
 * Turns a switch on and off through REST POST requests
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Settings = require('settings'); // See https://pebble.github.io/pebblejs/#settings

var key = Settings.option('aio-key'); // Get the key from a config...
if (key === undefined) {
    key = '54c2767878ca793f2e3cae1c45d62aa7ae9f8056';
}

Settings.config(
    { url: 'http://lediouris.net/pebble/REST.app.html' },
    function(e) { // OnOpen
        console.log('opening configurable:', JSON.stringify(e));
        // Reset aio-key before opening the webview
        Settings.option('aio-key', key);
    },
    function(e) { // OnClose. If the app is running, restart it.
        key = Settings.option('aio-key');
        console.log('closed configurable, Key:', key);
        if (e.failed === true) {
            console.log("Failed:" + JSON.stringify(e));
        }
    }
);

var xhr;

var PREFIX = "https://io.adafruit.com/api/feeds/";
var ONOFF_FEED = "onoff";

var main = new UI.Card({
    title: 'Switch.js',
    icon: 'images/menu_icon.png',
    subtitle: ' - ',
    body: 'Up  : ON\nDown: OFF',
    subtitleColor: 'indigo', // Named colors
    bodyColor: '#9a0036' // Hex colors
});

main.show();

var setSwitch = function(position) {
    console.log("Setting switch to " + position);
    var url = PREFIX + ONOFF_FEED + "/data";
    xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 201) {
            console.log("XHR returns", xhr.responseText);
            if (main !== undefined) {
                var card = main; // new UI.Card();
                var resp = JSON.parse(xhr.responseText);
                if (resp !== undefined && resp.value !== undefined) {
                    card.subtitle('Switch ' + resp.value);
                    card.show();
                }
            }
        } else {
            console.log("XHR: State:", xhr.status, " RS:", xhr.readyState);
        }
    };
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("X-AIO-Key", key);
    var data = { "value": position };
    xhr.send(JSON.stringify(data));
    console.log("Switch has been set");
};

main.on('click', 'select', function(e) {
    console.log("Do nothing");
});

main.on('click', 'up', function(e) {
    // Switch ON
    setSwitch('ON');
});

main.on('click', 'down', function(e) {
    // Switch OFF
    setSwitch('OFF');
});
