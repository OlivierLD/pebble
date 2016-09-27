var UI = require('ui');
var Vector2 = require('vector2');
var utils = require('./utils.js');


var now = new Date();

var day   = now.getDay();
var month = now.getMonth();
var year  = now.getFullYear();


var main = new UI.Card({
    title: 'Pebble.js',
    icon: 'images/menu_icon.png',
    subtitle: 'Hello World!',
    body: 'Press any button.\n' + (day + " " + MONTHS[month] + " " + year),
    subtitleColor: 'indigo', // Named colors
    bodyColor: '#9a0036' // Hex colors
});

main.show();

main.on('click', 'up', function(e) {
    var menu = new UI.Menu({
        sections: [{
            items: [{
                title: 'Pebble.js',
                icon: 'images/menu_icon.png',
                subtitle: 'Can do Menus'
            }, {
                title: 'Second Item',
                subtitle: 'Subtitle Text'
            }, {
                title: 'Third Item',
            }, {
                title: 'Fourth Item',
            }]
        }]
    });
    menu.on('select', function(e) {
        console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
        console.log('The item is titled "' + e.item.title + '"');
    });
    menu.show();
});

main.on('click', 'select', function(e) {
    console.log('On Select');
    var wind = new UI.Window({
        backgroundColor: 'white'
    });
    var topTextfield = new UI.Text({
        size: new Vector2(140, 60),
        font: 'gothic-18-bold',
        text: 'HDG',
        color: 'black',
        textAlign: 'center'
    });
    // 'gothic-24-bold',
    var textfield = new UI.Text({
        size: new Vector2(140, 60),
        font: 'bitham-42-bold',
        text: '1013.6',
        color: 'black',
        textAlign: 'center'
    });
    var bottomTextfield = new UI.Text({
        size: new Vector2(140, 60),
        text: 'True Heading',
        color: 'black',
        textAlign: 'center',
        position: new Vector2(0, 100),
    });
    var unitTextfield = new UI.Text({
        size: new Vector2(140, 60),
        text: 'degrees °',
        color: 'black',
        textAlign: 'center',
        position: new Vector2(0, 120),
    });
    var windSize = wind.size();
    // Center the textfield in the window
    var textfieldPos = textfield.position()
        .addSelf(windSize)
        .subSelf(textfield.size())
        .multiplyScalar(0.5);
    textfield.position(textfieldPos);
    wind.add(topTextfield);
    wind.add(textfield);
    wind.add(bottomTextfield);
    wind.add(unitTextfield);
    topTextfield.text('PRMSL');
    wind.show();
});

main.on('click', 'down', function(e) {
    var card = new UI.Card(); // Show the street view (image)
    card.title('A Card');
    card.subtitle('Is a Window');
    card.body('The simplest window type in Pebble.js.');
    card.show();
});


var utils = require('./utils.js');

var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var MONDAY = 1;
var THURSDAY = 4;

// Zones:
var ZONE_NW = { id: 1, label: "NW Block" }; // green
var ZONE_NE = { id: 2, label: "NE Block" }; // red
var ZONE_SW = { id: 3, label: "SW Block" }; // blue
var ZONE_SE = { id: 4, label: "SE Block" }; // yellow

// Times
var _12_TO_14 = "12 to 14";
var _13_TO_15 = "13 to 15";

var setup = function(month, year) {
    return { period: MONTHS[month] + " " + year,
        data: calculate(month, year) };
};

var plus = function(m, y) {
    var month = m+1;
    if (month > 11) {
        month = 0;
        y += 1;
    }
    return { year: y, month: month };
};

var minus = function(m, y) {
    var month = m-1;
    if (month < 0) {
        month = 11;
        y -= 1;
    }
    return { year: y, month: month };
};

var sameDay = function(dayOne, dayTwo) {
    return (dayOne.getFullYear() === dayTwo.getFullYear() &&
    dayOne.getMonth() === dayTwo.getMonth() &&
    dayOne.getDate() === dayTwo.getDate());
};

var calculate = function(month, year) {
    var scDays = [];

    var today = new Date();
    // First day of the week: Sunday
    var firstDay = new Date(year, month, 1, 0, 0, 0, 0);

    var mondayCount   = 0;
    var thursdayCount = 0;
    for (var d=1; d<=firstDay.getMonthDayCount(); d++) {
        var monthday = new Date(year, month, d, 0, 0, 0, 0);
        var weekday  = monthday.getDay();
        // Specific to the neighborhood
        if (weekday === MONDAY) {
            mondayCount++;
            if (mondayCount === 1 || mondayCount === 3) {
                scDays.push({ day: monthday, when: _12_TO_14, where: ZONE_NE, today: sameDay(today, monthday) });
            } else if (mondayCount === 2 || mondayCount === 4) {
                scDays.push({ day: monthday, when: _13_TO_15, where: ZONE_SW, today: sameDay(today, monthday) });
            }
        }
        if (weekday === THURSDAY) {
            thursdayCount++;
            if (thursdayCount === 1 || thursdayCount === 3) {
                scDays.push({ day: monthday, when: _13_TO_15, where: ZONE_NW, today: sameDay(today, monthday) });
            } else if (thursdayCount === 2 || thursdayCount === 4) {
                scDays.push({ day: monthday, when: _12_TO_14, where: ZONE_SE, today: sameDay(today, monthday) });
            }
        }
    }
    return scDays;
};
