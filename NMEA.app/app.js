/**
 * By OlivSoft
 *
 * For the fonts, see https://developer.pebble.com/blog/2013/07/24/Using-Pebble-System-Fonts/
 */
var Settings = require('settings'); // See https://pebble.github.io/pebblejs/#settings
var UI = require('ui');
var Vector2 = require('vector2');

var wsURI = 'ws://192.168.1.1:9876';   // TODO Get the URL from a config...  ws://192.168.1.176:9876

Settings.config(
  { url: 'http://lediouris.net/pebble/NMEA.app.html' },
  function(e) { // OnOpen
    console.log('opening configurable:', JSON.stringify(e));
    // Reset wsuri before opening the webview
    Settings.option({wsuri: wsURI});
  },
  function(e) { // OnClose
    var cfg = Settings.option();
    console.log('closed configurable:', JSON.stringify(e), JSON.stringify(cfg));
    if (e.failed === true) {
      console.log("Failed:" + JSON.stringify(e));
    }
  }
);

var ws = new WebSocket(wsURI);
var selectedChannel;

var main = new UI.Card({
  title: ' NMEA app',
  icon: 'images/paperboat.png',
  subtitle: '',
  body: 'Listens to ' + wsURI + '\nPress SELECT ->\nto start.\nDOWN for About ->'
});

main.show();
var inSelect = false;

var dataWind = new UI.Window({
  backgroundColor: 'white'
});
var topTextfield = new UI.Text({
  size: new Vector2(140, 60),
  font: 'gothic-18-bold',
  color: 'black',
  textAlign: 'center'
});
var dataTextfield = new UI.Text({
  size: new Vector2(140, 60),
  font: 'bitham-42-bold',
  color: 'black',
  borderColor: 'black',
  textAlign: 'center'
});
var descTextfield = new UI.Text({
  size: new Vector2(140, 60),
  font: 'gothic-14',
  color: 'black',
  textAlign: 'center',
  textOverflow: 'fill',
  position: new Vector2(0, 116),
});
var unitTextfield = new UI.Text({
  size: new Vector2(140, 60),
  color: 'black',
  textAlign: 'center',
  position: new Vector2(0, 130),
});
var windSize = dataWind.size();
// Center the dataTextfield in the window
var textfieldPos = dataTextfield.position()
      .addSelf(windSize)
      .subSelf(dataTextfield.size())
      .multiplyScalar(0.5);
dataTextfield.position(textfieldPos);
dataWind.add(topTextfield);
dataWind.add(dataTextfield);
dataWind.add(descTextfield);
dataWind.add(unitTextfield);

var setData = function(top, value, unit, desc) {
  topTextfield.text(top);
  dataTextfield.text(value);
  descTextfield.text(desc);
  unitTextfield.text(unit);
};

var displayData = function(payload) {
  var card = dataWind; // new UI.Card();
  if (card !== undefined) {
    var display = "No channel selected yet.";
    if (selectedChannel !== undefined) {
      if (!inSelect) {
        // payload['member'] => payload[channels[index].member].toFixed(channels[index].nbd)
        if (payload[selectedChannel.member]) {
          display = payload[selectedChannel.member].toFixed(selectedChannel.nbd);
        } else {
          display = '...';
        }
        setData(selectedChannel.chan,
                display,
                selectedChannel.unit,
                selectedChannel.desc);
        dataWind.show();
      }
    } else {
      console.log(display);
    }
  }
};

ws.onmessage = function (event) {
  var payload = JSON.parse(event.data);
  displayData(payload);
};

/*
 * in the payload, use 'member' to get the value:
 * payload['member'] => payload[channels[index].member].toFixed(channels[index].nbd)
 * This is an abstraction layer on top of the data returned by the app running on on RasPI.
 */
var channels = [ { chan: 'BSP',
                   desc: 'Boat Speed',
                   member: 'bsp',
                   nbd: 2,
                   unit: 'knots' },
                 { chan: 'HDG',
                   desc: 'Heading',
                   member: 'hdg',
                   nbd: 0,
                   unit: 'degrees °' },
                 { chan: 'DBT',
                   desc: 'Depth Below Transducer',
                   member: 'dbt',
                   nbd: 2,
                   unit: 'meters' },
                 { chan: 'SOG',
                   desc: 'Speed Over Ground',
                   member: 'sog',
                   nbd: 2,
                   unit: ' knots' },
                 { chan: 'COG',
                   desc: 'Course Over Ground',
                   member: 'cog',
                   nbd: 0,
                   unit: 'degrees °' },
                 { chan: 'AWA',
                   desc: 'Apparent Wind Angle',
                   member: 'awa',
                   nbd: 0,
                   unit: 'degrees °' },
                 { chan: 'AWS',
                   desc: 'Apparent Wind Speed',
                   member: 'aws',
                   nbd: 2,
                   unit: 'knots' },
                 { chan: 'TWA',
                   desc: 'True Wind Angle',
                   member: 'twa',
                   nbd: 0,
                   unit: 'degrees °' },
                 { chan: 'TWD',
                   desc: 'True Wind Direction',
                   member: 'twd',
                   nbd: 0,
                   unit: 'degrees °' },
                 { chan: 'TWS',
                   desc: 'True Wind Speed',
                   member: 'tws',
                   nbd: 2,
                   unit: 'knots' },
                 { chan: 'VMG',
                   desc: 'Velocity Made Good',
                   member: 'vmg',
                   nbd: 2,
                   unit: 'knots' },
                 { chan: 'CSP',
                   desc: 'Current Speed',
                   member: 'csp',
                   nbd: 2,
                  unit: 'knots' },
                 { chan: 'CDR',
                   desc: 'Current Direction',
                   member: 'cdr',
                   nbd: 0,
                   unit: 'degrees °' },
                 { chan: 'CMG',
                   desc: 'Course Made Good',
                   member: 'cmg',
                   nbd: 0,
                   unit: 'degrees °' },
                 { chan: 'DWP',
                   desc: 'Distance to Waypoint',
                   member: 'dwp',
                   nbd: 2,
                   unit: 'nm' },
                 { chan: 'PRMSL',
                   desc: 'Pressure at Mean Sea Level',
                   member: 'prmsl',
                   nbd: 1,
                   unit: 'hPa' },
                 { chan: 'WTMP',
                   desc: 'Water Temperature',
                   member: 'wtemp',
                   nbd: 1,
                   unit: '°C' },
                 { chan: 'ATMP',
                   desc: 'Air Temperature',
                   member: 'atemp',
                   nbd: 1,
                   unit: '°C' },
                 { chan: 'HUM',
                   desc: 'Relative Humidity',
                   member: 'hum',
                   nbd: 1,
                   unit: '%' }];

// icon: 'images/paperboat.png',

var menuItems = [{
        title: 'NMEA display',
        subtitle: 'Choose the data'
      }];

channels.forEach(function(chan) {
  menuItems.push({title: chan.chan, subtitle: chan.desc });
});

var displayMenu = function() {
  inSelect = true;
//console.log('Choosing the data to display');
  var menu = new UI.Menu({
    sections: [{
      items: menuItems
    }]
  });
//console.log('2 - Menu populated');
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '", desc ' + e.item.subtitle);
    if (e.itemIndex > 0) {
      selectedChannel = channels[e.itemIndex - 1];
      console.log("Selected channel:" + JSON.stringify(selectedChannel));
      inSelect = false;
      displayData({}); // Display dummy data
    }
  });

  menu.on('back', function(e) { // No such event...
    menu.hide();
  });
//console.log('3 - Showing menu');
  menu.show();
//console.log('4 - Menu should be visible');
};

main.on('click', 'select', function(e) {
  displayMenu();
});

dataWind.on('click', 'back', function(e) {
  dataWind.hide();
  displayMenu();
});

main.on('click', 'up', function(e) {
  console.log('Main UP');
});

main.on('click', 'down', function(e) {
  console.log('Main DOWN');
  var about = new UI.Card({
    title: ' about OlivSoft',
    subtitle: '',
    icon: 'images/paperboat.png',
    scrollable: true,
    body: 'Works on WebSockets NMEA Server possibly running onboard, on a Raspberry PI, see http://www.lediouris.net/RaspberryPI/_Articles/readme.html for more details...'
  });
  about.on('click', 'back', function(e) {
    about.hide();
  });
  about.show();
});
