var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var MONDAY = 1;
var THURSDAY = 4;

var setup = function() {
//alert("Let's go!");
  var now = new Date();
  var month = now.getMonth();
  var year  = now.getFullYear();

  display(month, year);
};

var plus = function(m, y) {
  var month = m+1;
  if (month > 11) {
  	month = 0;
  	y += 1;
  }
  display(month, y);
};

var minus = function(m, y) {
  var month = m-1;
  if (month < 0) {
  	month = 11;
  	y -= 1;
  }
  display(month, y);
};

var sameDay = function(dayOne, dayTwo) {
  return (dayOne.getFullYear() === dayTwo.getFullYear() &&
  	      dayOne.getMonth() === dayTwo.getMonth() &&
  	      dayOne.getDate() === dayTwo.getDate());
};

var display = function(month, year) {
//console.log(MONTHS[month] + " " + year);
  var today = new Date();

  // First day: Sunday
  var firstDay = new Date(year, month, 1, 0, 0, 0, 0);
  var firstDayWeekDay = firstDay.getDay();
  
  var code = "";      
  code += ("<h2> <input type='button' onclick='minus(" + month + ", " + year + ");' value='<''></input> " + MONTHS[month] + " " + year + " <input type='button' onclick='plus(" + month + ", " + year + ");' value='>''></input> </h2>");
  code += ("<table border='1'>");
  code += ("<tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>");
  code += (" <tr>");
  if (firstDayWeekDay !== 0) {
  	code += ("    <td colspan='" + firstDayWeekDay + "'>&nbsp;</td>");
  }
  var mondayCount   = 0;
  var thursdayCount = 0;
  for (var d=1; d<=firstDay.getMonthDayCount(); d++) {
  	var monthday = new Date(year, month, d, 0, 0, 0, 0);
  	var weekday  = monthday.getDay();
  	if (weekday === 0) {
  		code += ("</tr><tr>");
  	}
  	// Specific to the neighborhood
  	var bg = 'white';
  	var time = "&nbsp;";
    if (weekday === MONDAY) {
    	mondayCount++;
    	if (mondayCount === 1 || mondayCount === 3) {
    		bg = 'red';
    		time = "12 to 14";

    	} else if (mondayCount === 2 || mondayCount === 4) {
    		bg = 'cyan';
    		time = "13 to 15";
    	}
    }
    if (weekday === THURSDAY) {
    	thursdayCount++;
    	if (thursdayCount === 1 || thursdayCount === 3) {
    		bg = 'lightgreen';
    		time = "13 to 15";
    	} else if (thursdayCount === 2 || thursdayCount === 4) {
    		bg = 'yellow';
    		time = "12 to 14";
    	}
    }
    
  	code += ("<td bgcolor='" + bg + "' valign='top' align='center'>" + (sameDay(today, monthday) ? "<b><font color='blue'>" : "") + monthday.format("d-M-Y") + (sameDay(today, monthday) ? "</font></b>" : "") + "<br>" + time + "</td>");
//  console.log(monthday.format("l d-M-Y")); 
  }

  code += ("</tr></table>");
  document.getElementById("scmonth").innerHTML = code;
};
