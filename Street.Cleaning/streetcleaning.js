"use strict";

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

// Example
(function() {
  var now = new Date();

  var month = now.getMonth();
  var year  = now.getFullYear();

  var sc = setup(month, year);
  console.log(JSON.stringify(sc, null, 2));

  var next = plus(month, year);
  sc = setup(next.month, next.year);
  console.log(JSON.stringify(sc, null, 2));

  var prev = minus(month, year);
  sc = setup(prev.month, prev.year);
  console.log(JSON.stringify(sc, null, 2));

})();
