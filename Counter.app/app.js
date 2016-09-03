/**
 * A simple sheep counter.
 * Up     +1
 * Down   -1
 * Select Reset
 */
var UI = require('ui');
var Vector2 = require('vector2');

var counterValue = 0;

var main = new UI.Card({
  title: ' Counter',
  icon: 'images/menu_icon.png',
  subtitle: 'Operation:',
  body: 'Up:+ Down:- Select:Reset'
});

main.show();

// New data window for the counter value
var dataWind = new UI.Window({
  backgroundColor: 'white'
});
var dataTextfield = new UI.Text({
  size: new Vector2(140, 60),
  font: 'bitham-42-bold',
  color: 'black',
  borderColor: 'black',
  textAlign: 'center'
});
var windSize = dataWind.size();
var textfieldPos = dataTextfield.position()
      .addSelf(windSize)
      .subSelf(dataTextfield.size())
      .multiplyScalar(0.5);
dataTextfield.position(textfieldPos);
dataWind.add(dataTextfield);

var setData = function(value) {
  dataTextfield.text(value);
};

var displayValue = function() {
  if (dataWind !== undefined) {
    var card = dataWind;
    setData(counterValue);
    card.show();
  }
};

var select = function(e) {
  counterValue = 0;
  displayValue();
};

main.on('click', 'select', select);
dataWind.on('click', 'select', select);

var up = function(e) {
  counterValue += 1;
  displayValue();
};
main.on('click', 'up', up);
dataWind.on('click', 'up', up);

var down = function(e) {
  counterValue -= 1;
  displayValue();
};

main.on('click', 'down', down);
dataWind.on('click', 'down', down);
