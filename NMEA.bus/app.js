var UI = require('ui');

var ws = new WebSocket('ws://192.168.1.176:8765');    // Replace with IP of computer running server

ws.onmessage = function (event) { 
  var card = main; // new UI.Card(); // DO NOT create a new card!
  if (card !== undefined) {
//  console.log("Data from server:" + event.data);
    card.title('NMEA Data');
    try {
      var json = JSON.parse(event.data);
      card.subtitle('BSP:');
      card.body(json.bsp.toFixed(2) + " kts.");
    } catch (err) {
      console.log(err);
      card.body(event.data);
    }
    card.show();
  }
};

var main = new UI.Card({
  title: 'Connected',
  icon: 'images/paperboat.png',
  subtitle: 'Waiting for data'
});
main.show();
