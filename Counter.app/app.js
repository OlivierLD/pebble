/**
 * A simple counter.
 * Up     +1
 * Down   -1
 * Select Reset
 */
var UI = require('ui');

var counterValue = 0;

var main = new UI.Card({
  title: ' Counter',
  icon: 'images/menu_icon.png',
  subtitle: counterValue,
  body: 'Up  : +\nDown: -\nSelect: Reset'
});

main.show();

var displayValue = function() {
  if (main !== undefined) {
    var card = main; // new UI.Card();
    card.subtitle(counterValue);
    card.show();
  }
};

main.on('click', 'select', function(e) {
  counterValue = 0;
  displayValue();
});

main.on('click', 'up', function(e) {
  counterValue += 1;
  displayValue();
});

main.on('click', 'down', function(e) {
  counterValue -= 1;
  displayValue();
});
