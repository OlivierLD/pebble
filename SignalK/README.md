## WebSocket client for SignalK

Start the SignalK server
```bash
 $> bin/nmea-from-tcp
```
This also starts a WebSocket server, its URL is `ws://localhost:3000/signalk/v1/stream`.

You can see this URL from any REST client (PostMan, your browser), by issuing to the SignalK server a request like
```
 GET /signalk
```
![GET request](./GET.png)

See above the member that says `signalk-ws `. It gives you the port and the path.

The Pebble app uses this connection to read the data produced by SignalK.

The connection above is to be set in the Settings.

![Configuration](./config.png)

![Menu](./00.png) ![Main](./01.png) ![Second](./02.png) ![Third](./03.png)etc...

---