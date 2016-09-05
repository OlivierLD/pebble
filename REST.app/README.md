## Pebble REST client, used to reach an IoT server

Sample REST client application featuring
- Configuration
- Action Bar
- REST client interface

Reaches the Internet of Things server at io.adafruit.com. You need an `Adafruit-IO` account, its key will be
required to access the data.

![IoT switch](switch.png)

This goes along the project described [here](https://github.com/OlivierLD/node.pi#iot-demo).
There are several sensors and switches connected to a Raspberry PI, also feeding and listening to the IoT server mentioned above.

You turn the switch on and off from the watch, and the Raspberry takes the expected action at the other end.