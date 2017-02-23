## WebSocket client for SignalK

Start the SignalK server
```bash
 $> bin/nmea-from-tcp
```
This also starts a WebSocket server, its URL is ws://localhost/signalk/v1/stream.

The Pebble app uses this connection to read the data produced by SignalK.

The connection above is to be set in the Settings.

![Configuration](./config.png)

![Menu](./00.png) ![Main](./01.png) ![Second](./02.png) ![Third](./03.png)etc...