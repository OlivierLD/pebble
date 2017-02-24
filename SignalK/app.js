/**
 * By OlivSoft
 * WebSocket client for SignalK
 *
 * For the fonts, see https://developer.pebble.com/blog/2013/07/24/Using-Pebble-System-Fonts/
 */
var Settings = require('settings'); // See https://pebble.github.io/pebblejs/#settings
var UI = require('ui');
var Vector2 = require('vector2');

var wsURI = Settings.option('wsuri'); // Get the URL from a config...  ws://192.168.1.176:3000/signalk/v1/stream
if (wsURI === undefined) {
    wsURI = 'ws://192.168.1.177:3000/signalk/v1/stream';
}

Settings.config(
    { url: 'http://lediouris.net/pebble/SignalK.app.html' },
    function(e) { // OnOpen
        console.log('opening configurable:', JSON.stringify(e));
        // Reset wsuri before opening the webview
//  Settings.option({wsuri: wsURI});
        Settings.option('wsuri', wsURI);
    },
    function(e) { // OnClose. If the app is running, restart it.
        wsURI = Settings.option('wsuri');
        console.log('closed configurable, wsURI:', wsURI);
        if (e.failed === true) {
            console.log("Failed:" + JSON.stringify(e));
        }
    }
);

console.log('Connecting to ' + wsURI);
var ws = new WebSocket(wsURI);

var selectedChannel;

var main = new UI.Card({
    title: ' SignalK',
    icon: 'images/SignalK.png',
    subtitle: '',
    body: 'Listens to ' + wsURI + '.',
    action: {
        select: 'images/music_icon_play.png',
        down: 'images/music_icon_ellipsis.png'
    }
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
    if (value === '...' && dataTextfield.text === '') {
        dataTextfield.text(value);
    } else if (value !== '...') {
        dataTextfield.text(value);
    }
    descTextfield.text(desc);
    unitTextfield.text(unit);
};

var findInArray = function(array, key) {
    var value;
    for (var i=0; i<array.length; i++) {
        if (array[i].path === key) {
            value = array[i].value;
            break;
        }
    }
    return value;
};

var toDegrees = function(angle) {
    return angle * (180 / Math.PI);
};

var msToKnots = function(ms) {
    return ms * 3600 / 1852;
};

var dataExtractor = function(payload, key) {
    if (payload.updates !== undefined) {
        if (payload.updates[0].values !== undefined) {
            switch (key) {
                case 'bsp':
                    var bsp = findInArray(payload.updates[0].values, 'navigation.speedThroughWater');
                    return msToKnots(bsp);
                case 'hdg':
                    var hdg = findInArray(payload.updates[0].values, 'navigation.headingMagnetic');
                    return toDegrees(hdg);
                case 'dbt':
                    var dbt = findInArray(payload.updates[0].values, 'environment.depth.belowTransducer');
                    return dbt;
                case 'sog':
                    var sog = findInArray(payload.updates[0].values, 'navigation.speedOverGround');
                    return msToKnots(sog);
                case 'cog':
                    var cog = findInArray(payload.updates[0].values, 'navigation.courseOverGroundTrue');
                    return toDegrees(cog);
                case 'twa':
                    var twa = findInArray(payload.updates[0].values, 'environment.wind.angleTrueWater');
                    return toDegrees(twa);
                case 'tws':
                    var tws = findInArray(payload.updates[0].values, 'environment.wind.speedTrue');
                    return msToKnots(tws);
                case 'cdr':
                    var current1 = findInArray(payload.updates[0].values, 'environment.current');
                    if (current1 !== undefined) {
                        var cdr = current1.setTrue;
                        return toDegrees(cdr);
                    }
                    break;
                case 'csp':
                    var current2 = findInArray(payload.updates[0].values, 'environment.current');
                    if (current2 !== undefined) {
                        var csp = current2.drift;
                        return msToKnots(csp);
                    }
                    break;
                case 'vmg':
                    var vmg = findInArray(payload.updates[0].values, 'performance.velocityMadeGood');
                    return msToKnots(vmg);
                case 'wtemp':
                    var wtemp = findInArray(payload.updates[0].values, 'environment.water.temperature');
                    if (wtemp !== undefined) {
                        wtemp -= 273.6; // Kelvin to Celcius
                        return wtemp;
                    }
                    break;
                case 'awa':
                    var awa = findInArray(payload.updates[0].values, 'environment.wind.angleApparent');
                    return toDegrees(awa);
                case 'aws':
                    var aws = findInArray(payload.updates[0].values, 'environment.wind.speedApparent');
                    return msToKnots(aws);
                case 'atemp':
                case 'dwp':
                case 'prmsl':
                case 'hum':
                case 'cmg':
                    break;
                default:
                    break;
            }
        }
    }
    return null;
};

var getBSP = function(payload) {
    return dataExtractor(payload, 'bsp');
};
var getHDG = function(payload) {
    return dataExtractor(payload, 'hdg');
};
var getDBT = function(payload) {
    return dataExtractor(payload, 'dbt');
};
var getSOG = function(payload) {
    return dataExtractor(payload, 'sog');
};
var getCOG = function(payload) {
    return dataExtractor(payload, 'cog');
};
var getTWA = function(payload) {
    return dataExtractor(payload, 'twa');
};
var getTWS = function(payload) {
    return dataExtractor(payload, 'tws');
};
var getAWA = function(payload) {
    return dataExtractor(payload, 'awa');
};
var getAWS = function(payload) {
    return dataExtractor(payload, 'aws');
};
var getCDR = function(payload) {
    return dataExtractor(payload, 'cdr');
};
var getCSP = function(payload) {
    return dataExtractor(payload, 'csp');
};
var getVMG = function(payload) {
    return dataExtractor(payload, 'vmg');
};
var getWTEMP = function(payload) {
    return dataExtractor(payload, 'wtemp');
};
var notImplemented = function(payload) {
    return '...';
};

var displayData = function(payload) {
    var card = dataWind; // new UI.Card();
    if (card !== undefined) {
        var display = "No channel selected yet.";
        if (selectedChannel !== undefined) {
            if (!inSelect) {
                var value =  selectedChannel.parser(payload);
                if (value && value !== '...') {
                    display = value.toFixed(selectedChannel.nbd);
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

ws.onopen = function() {
    console.log('Connection established');
    var subscriptionObject = {
        "context": "vessels.self",
        "subscribe": [{
            "path": "*"
        }]
    };
    var subscriptionMessage = JSON.stringify(subscriptionObject);
    console.log("Sending subscription:" + subscriptionMessage);
    ws.send(subscriptionMessage); // Subscribe
};

ws.onmessage = function (event) {
    var payload = JSON.parse(event.data);
    console.log('Received ', payload);
    displayData(payload);
};

ws.onclose = function() {
    console.log("ws close");
};

/*
 * in the payload, use 'parser' to get the value:
 * This is an abstraction layer on top of the data returned by SignalK.
 */
var channels = [
    {   chan: 'BSP',
        desc: 'Boat Speed',
        parser: getBSP,
        nbd: 2,
        unit: 'knots' },
    {   chan: 'HDG',
        desc: 'Heading',
        parser: getHDG,
        nbd: 0,
        unit: 'degrees °' },
    {   chan: 'DBT',
        desc: 'Depth Below Transducer',
        parser: getDBT,
        nbd: 2,
        unit: 'meters' },
    {   chan: 'SOG',
        desc: 'Speed Over Ground',
        parser: getSOG,
        nbd: 2,
        unit: ' knots' },
    {   chan: 'COG',
        desc: 'Course Over Ground',
        parser: getCOG,
        nbd: 0,
        unit: 'degrees °' },
    {   chan: 'AWA',
        desc: 'Apparent Wind Angle',
        parser: getAWA,
        nbd: 0,
        unit: 'degrees °' },
    {   chan: 'AWS',
        desc: 'Apparent Wind Speed',
        parser: getAWS,
        nbd: 2,
        unit: 'knots' },
    {   chan: 'TWA',
        desc: 'True Wind Angle',
        parser: getTWA,
        nbd: 0,
        unit: 'degrees °' },
    {   chan: 'TWD',
        desc: 'True Wind Direction',
        parser: notImplemented,
        nbd: 0,
        unit: 'degrees °' },
    {   chan: 'TWS',
        desc: 'True Wind Speed',
        parser: getTWS,
        nbd: 2,
        unit: 'knots' },
    {   chan: 'VMG',
        desc: 'Velocity Made Good',
        parser: getVMG,
        nbd: 2,
        unit: 'knots' },
    {   chan: 'CSP',
        desc: 'Current Speed',
        parser: getCSP,
        nbd: 2,
        unit: 'knots' },
    {   chan: 'CDR',
        desc: 'Current Direction',
        parser: getCDR,
        nbd: 0,
        unit: 'degrees °' },
    {   chan: 'CMG',
        desc: 'Course Made Good',
        parser: notImplemented,
        nbd: 0,
        unit: 'degrees °' },
    {   chan: 'DWP',
        desc: 'Distance to Waypoint',
        parser: notImplemented,
        nbd: 2,
        unit: 'nm' },
    {   chan: 'PRMSL',
        desc: 'Pressure at Mean Sea Level',
        parser: notImplemented,
        nbd: 1,
        unit: 'hPa' },
    {   chan: 'WTMP',
        desc: 'Water Temperature',
        parser: getWTEMP,
        nbd: 1,
        unit: '°C' },
    {   chan: 'ATMP',
        desc: 'Air Temperature',
        parser: notImplemented,
        nbd: 1,
        unit: '°C' },
    {   chan: 'HUM',
        desc: 'Relative Humidity',
        parser: notImplemented,
        nbd: 1,
        unit: '%' }];

// icon: 'images/paperboat.png',

var menuItems = [{
    title: 'NMEA Data',
    subtitle: 'Choose the data'
}];

channels.forEach(function(chan) {
    menuItems.push({title: chan.chan, subtitle: chan.desc });
});

var displayMenu = function() {
    inSelect = true;
//console.log('Choosing the data to calculate');
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
        title: 'SignalK client',
        subtitle: '',
        icon: 'images/SignalK.png',
        scrollable: true,
        body: 'Works on WebSocket SignalK Server, possibly running on board.'
    });
    about.on('click', 'back', function(e) {
        about.hide();
    });
    about.show();
});
