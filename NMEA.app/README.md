## Pebble NMEA app

Copy the content of `app.js` in your [CloudPebble](https://cloudpebble.net/ide/) account.

In `app.js`, modify the `wsURI` variable, set the IP address of the WebSocket server.

In the `RESOURCES` section, add the `small.boat.png` file, name it `paperboat.png`, as mentionned in the code.

Then in the `COMPILATION` section, start a build, followed by `INSTALL AND RUN`.

You should be good to go!

<table>
  <tr>
    <td>
      Application list
      <br/>
      <img src="screenshot.01.png" alt="Start here">
    </td>
    <td>
      Press select to start
      <br/>
      <img src="screenshot.02.png" alt="Choose the channel">
    </td>
    <td>
      Srcoll...
      <br/>
      <img src="screenshot.03.png" alt="Channel list">
    </td>
  </tr>
  <tr>
    <td>
      Choose...
      <br/>
      <img src="screenshot.04.png" alt="Hit select">
    </td>
    <td>
      Displayed!
      <br/>
      <img src="screenshot.05.png" alt="Display">
    </td>
  </tr>
</table>

This app is a WebSocket client for the application described [here](http://www.lediouris.net/RaspberryPI/_Articles/readme.html).

All the data you want on your wrist, for less that $100!