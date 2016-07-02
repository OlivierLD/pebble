"use sctrict";

// see https://github.com/geek/pebble-socket-example
var UI = require('ui');

// Replace with IP of computer running server
var ws = new WebSocket('ws://192.168.1.176:9876');    

ws.onmessage = function (event) { 
  var card = main; // new UI.Card();
  if (card !== undefined) {
    card.title('From server:');
    var payload = JSON.parse(event.data);
    card.subtitle(payload.data);
    card.show();
  }
};

var main = new UI.Card({
  title: 'Connected',
  icon: 'images/menu_icon.png',
  subtitle: 'Waiting for data...',
  scrollable: true
});
main.show();
