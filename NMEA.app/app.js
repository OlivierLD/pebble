/**
 * By OlivSoft
 */

var UI = require('ui');

var ws = new WebSocket('ws://192.168.1.176:9876');  // TODO Get the URL from a config...

var main = new UI.Card({
  title: ' OlivSoft',
  icon: 'images/paperboat.png',
  subtitle: 'NMEA App',
  body: 'Press SELECT to start.'
});

main.show();
var inSelect = false;

ws.onmessage = function (event) { 
  var card = main; // new UI.Card();
  if (card !== undefined) {
    card.title('  Data:');
    var payload = JSON.parse(event.data);
    var display = "No channel selected";
    if (selectedChannel !== undefined) {
      if (!inSelect) {
        // payload['member'] => payload[channels[index].member].toFixed(channels[index].nbd)
        if (payload[selectedChannel.member]) {
          display = selectedChannel.chan + ":" + 
                    payload[selectedChannel.member].toFixed(selectedChannel.nbd) +
                    selectedChannel.unit;
        } else {
          display = 'Not available';
        }
        card.subtitle(display);
        card.body(selectedChannel.desc);
        card.show();
      }
    } else {
      console.log(display);
    }
  }
};

/*
 * in the payload, use 'member' to get the value:
 * payload['member'] => payload[channels[index].member].toFixed(channels[index].nbd)
 */
var channels = [ { chan: 'BSP',
                   desc: 'Boat Speed',
                   member: 'bsp',
                   nbd: 2,
                   unit: ' kts' },
                 { chan: 'HDG', 
                   desc: 'Heading',
                   member: 'hdg',
                   nbd: 0,
                   unit: '°' },
                 { chan: 'DBT',
                   desc: 'Depth Below Transducer',
                   member: 'dbt',
                   nbd: 2,
                   unit: ' m' },                 
                 { chan: 'SOG',
                   desc: 'Speed Over Ground',
                   member: 'sog',
                   nbd: 2,
                   unit: ' kts' },                 
                 { chan: 'COG',
                   desc: 'Course Over Ground',
                   member: 'cog',
                   nbd: 0,
                   unit: '°' },                 
                 { chan: 'AWA', 
                   desc: 'Apparent Wind Angle',
                   member: 'awa',
                   nbd: 0,
                   unit: '°' },
                 { chan: 'AWS', 
                   desc: 'Apparent Wind Speed',
                   member: 'aws',
                   nbd: 2,
                   unit: ' kts' },
                 { chan: 'TWA', 
                   desc: 'True Wind Angle',
                   member: 'twa',
                   nbd: 0,
                   unit: '°' },
                 { chan: 'TWD', 
                   desc: 'True Wind Direction',
                   member: 'twd',
                   nbd: 0,
                   unit: '°' },
                 { chan: 'TWS', 
                   desc: 'True Wind Speed',
                   member: 'tws',
                   nbd: 2,
                   unit: ' kts' },
                 { chan: 'VMG', 
                   desc: 'Velocity Made Good',
                   member: 'vmg',
                   nbd: 2,
                   unit: ' kts' },
                 { chan: 'CSP', 
                   desc: 'Current Speed',
                   member: 'csp',
                   nbd: 2,
                  unit: ' kts' },
                 { chan: 'CDR', 
                   desc: 'Current Direction',
                   member: 'cdr',
                   nbd: 0,
                   unit: '°' },
                 { chan: 'CMG', 
                   desc: 'Course Made Good',
                   member: 'cmg',
                   nbd: 0,
                   unit: '°' },
                 { chan: 'DWP', 
                   desc: 'Distance to Waypoint',
                   member: 'dwp',
                   nbd: 2,
                   unit: ' nm' },
                 { chan: 'PRMSL', 
                   desc: 'Pressure at Mean Sea Level',
                   member: 'prmsl',
                   nbd: 1,
                   unit: ' hPa' },
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
                   unit: ' %' }];

var selectedChannel;

// icon: 'images/paperboat.png',

var menuItems = [{
        title: 'NMEA display',
        subtitle: 'Choose the data'
      }];

channels.forEach(function(chan) {
  menuItems.push({title: chan.chan, subtitle: chan.desc });
});      

main.on('click', 'select', function(e) {
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
    selectedChannel = channels[e.itemIndex - 1];
    console.log("Selected channel:" + JSON.stringify(selectedChannel));
    inSelect = false;
  });
//console.log('3 - Showing menu');
  menu.show();
//console.log('4 - Menu should be visible');
});

main.on('click', 'up', function(e) {
  console.log('Main UP');
});

main.on('click', 'down', function(e) {
  console.log('Main DOWN');
});
