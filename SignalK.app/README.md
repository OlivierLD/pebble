## WebSocket client for SignalK

Start the SignalK server
```bash
 $> bin/nmea-from-tcp
```
This also starts a WebSocket server, its URL is ws://localhost/signalk/v1/stream.

The Pebble app uses this connection to read the data produced by SignalK.
