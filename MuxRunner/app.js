/**
 * Mux Runner client.
 */

var Settings = require('settings'); // See https://pebble.github.io/pebblejs/#settings
var UI = require('ui');
var Vector2 = require('vector2');

var resturl = Settings.option('resturl');

Settings.config(
    { url: 'http://lediouris.net/pebble/MuxRunner.app.html' },
    function(e) { // OnOpen
        console.log('opening configurable:', JSON.stringify(e));
        // Reset wsuri before opening the webview
//      Settings.option({wsuri: wsURI});
        Settings.option('resturl', resturl);
    },
    function(e) { // OnClose. If the app is running, restart it.
        resturl = Settings.option('resturl');
        console.log('closed configurable, rest url:', resturl);
        if (e.failed === true) {
            console.log("Failed:" + JSON.stringify(e));
        }
    }
);

if (resturl === undefined) {
  resturl = '192.168.42.1';
}
console.log('Connecting to ' + resturl);

var main = new UI.Card({
  title: ' Runner',
  icon: 'images/runner_23x25.png',
  subtitle: '',
  body: 'Ping ' + resturl + '.\n' + 'Up: on\nDown: off\nSelect: Display',
  action: {
    up: 'images/action_bar_icon_check.png',
    select: 'images/music_icon_play.png',
    down: 'images/action_bar_icon_dismiss.png'
  }
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
  var wind = new UI.Window({
    backgroundColor: 'black'
  });
  var radial = new UI.Radial({
    size: new Vector2(140, 140),
    angle: 0,
    angle2: 300,
    radius: 20,
    backgroundColor: 'cyan',
    borderColor: 'celeste',
    borderWidth: 1,
  });
  var textfield = new UI.Text({
    size: new Vector2(140, 60),
    font: 'gothic-24-bold',
    text: 'Dynamic\nWindow',
    textAlign: 'center'
  });
  var windSize = wind.size();
  // Center the radial in the window
  var radialPos = radial.position()
      .addSelf(windSize)
      .subSelf(radial.size())
      .multiplyScalar(0.5);
  radial.position(radialPos);
  // Center the textfield in the window
  var textfieldPos = textfield.position()
      .addSelf(windSize)
      .subSelf(textfield.size())
      .multiplyScalar(0.5);
  textfield.position(textfieldPos);
  wind.add(radial);
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});
