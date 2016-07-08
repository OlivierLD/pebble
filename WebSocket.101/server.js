/**
 * First time:
 *  $> npm install
 * Then 
 *  $> node server.js <options>
 * Options are:
 *   -help
 *   -verbose true|[false]
 *   -port [9876]
 * You can also use
 *  $> npm start
 * or
 *  $> npm start -- <options>
 *
 * This is mostly a data simulator for NMEA.
 * It can be used with the Pebble App at https://github.com/OlivierLD/pebble/tree/master/NMEA.app,
 * or by any app that needs to consume nema data over WbSockets.
 * data structure looks like this:
 {
  "csp": 0.01,
  "hum": 50,
  "wtemp": 12,
  "sog": 6,
  "bat": 12,
  "prmsl": 1013,
  "daylog": 120,
  "lat": 37.5013,
  "lng": -122.48091666666667,
  "cdr": 0,
  "dbt": 10,
  "atemp": 19,
  "bsp": 6,
  "cmg": 0,
  "twa": 0,
  "twd": 0,
  "tws": 10,
  "log": 9800,
  "awa": 0,
  "hdg": 0,
  "cog": 0,
  "aws": 0
 }
 *
 * Usage is:
 */
// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

var verbose = false;
// Port where we'll run the websocket server
var port = 9876;

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-nmea';

console.log("For help, run: node " + __filename + " -help");
for (var i=0; i<process.argv.length; i++) {
  if (process.argv[i] === "-help" || process.argv[i] === "-h" || process.argv[i] === "-?") {
    console.log("Usage: node " + __filename + " -help -verbose true -port 9876");
    process.exit(0);
  } else if (process.argv[i] === "-port") {
    port = parseInt(process.argv[i+1]);
  } else if (process.argv[i] === "-verbose") {
    verbose = "true" === process.argv[i+1];
  }
}
  
/*
 * WebSocket server for NMEA
 * Static requests must be prefixed with /data/, like in http://machine:9876/data/console.html
 */

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

 
if (typeof String.prototype.startsWith != 'function') 
{
  String.prototype.startsWith = function (str)
  {
    return this.indexOf(str) == 0;
  };
}

if (typeof String.prototype.endsWith != 'function') 
{
  String.prototype.endsWith = function(suffix) 
  {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

function handler (req, res) 
{
  var respContent = "";
  if (verbose === true)
  {
    console.log("Speaking HTTP from " + __dirname);
    console.log("Server received an HTTP Request:\n" + req.method + "\n" + req.url + "\n-------------");
    console.log("ReqHeaders:" + JSON.stringify(req.headers, null, '\t'));
    console.log('Request:' + req.url);    
    var prms = require('url').parse(req.url, true);
    console.log(prms);
    console.log("Search: [" + prms.search + "]");
    console.log("-------------------------------");
  }
  if (req.url.startsWith("/data/")) // Static resource
  {
    var resource = req.url.substring("/data/".length);
    if (resource.indexOf("?") > -1) {
      resource = resource.substring(0, resource.indexOf("?"));
    }
    console.log('Loading static ' + req.url + " (" + resource + ")");
    fs.readFile(__dirname + '/' + resource,
                function (err, data)
                {
                  if (err)
                  {
                    res.writeHead(500);
                    return res.end('Error loading ' + resource);
                  }
               // if (verbose)
               //   console.log("Read resource content:\n---------------\n" + data + "\n--------------");
                  var contentType = "text/html";
                  if (resource.endsWith(".css"))
                    contentType = "text/css";
                  else if (resource.endsWith(".html"))
                    contentType = "text/html";
                  else if (resource.endsWith(".xml"))
                    contentType = "text/xml";
                  else if (resource.endsWith(".js"))
                    contentType = "text/javascript";
                  else if (resource.endsWith(".jpg"))
                    contentType = "image/jpg";
                  else if (resource.endsWith(".gif"))
                    contentType = "image/gif";
                  else if (resource.endsWith(".png"))
                    contentType = "image/png";
                  else if (resource.endsWith(".ico"))
                    contentType = "image/ico";

                  res.writeHead(200, {'Content-Type': contentType});
              //  console.log('Data is ' + typeof(data));
                  if (resource.endsWith(".jpg") || 
                      resource.endsWith(".gif") ||
                      resource.endsWith(".ico") ||
                      resource.endsWith(".png"))
                  {
                //  res.writeHead(200, {'Content-Type': 'image/gif' });
                    res.end(data, 'binary');
                  }
                  else
                    res.end(data.toString().replace('$PORT$', port.toString())); // Replace $PORT$ with the actual port value.
                });
  }
  else if (req.url == "/")
  {
    if (req.method === "POST")
    {
      var data = "";
      console.log("---- Headers ----");
      for(var item in req.headers) 
        console.log(item + ": " + req.headers[item]);
      console.log("-----------------");

      req.on("data", function(chunk)
      {
        data += chunk;
      });

      req.on("end", function()
      {
        console.log("POST request: [" + data + "]");
        res.writeHead(200, {'Content-Type': 'application/json'});
        var status = {'status':'OK'};
        res.end(JSON.stringify(status));
      });
    }
  }
  else
  {
    console.log("Unmanaged request: [" + req.url + "]");
  //console.log(">>> " + JSON.stringify(req, null, 2));
    respContent = "Response from " + req.url;
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end(); // respContent);
  }
} // HTTP Handler


/**
 * Global variables
 */
// list of currently connected clients (users)
var clients = [ ];
 
/**
 * HTTP server
 */
var server = http.createServer(handler);

server.listen(port, function() 
{
  console.log((new Date()) + " Server is listening on port " + port);
  console.log("Connect to [ws://localhost:" + port + "/]");
});
 
/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});
 
// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) 
{
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
 
    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    clients.push(connection);
    console.log((new Date()) + ' Connection accepted.');
 
    // user sent some message
    connection.on('message', function(message) 
    {
//    console.log("On Message:" + JSON.stringify(message));

      if (message.type === 'utf8') 
      { // accept only text
  //    console.log((new Date()) + ' Received Message: ' + message.utf8Data);
  //    console.log("Rebroadcasting: " + message.utf8Data);
        for (var i=0; i < clients.length; i++) 
        {
          clients[i].sendUTF(message.utf8Data);
        }
      }
    });
 
    // user disconnected
    connection.on('close', function(code)
    {
      // Close
      console.log((new Date()) + ' Connection closed.');
      var nb = clients.length;
      for (var i=0; i<clients.length; i++) {
        if (clients[i] === connection) {
          clients.splice(i, 1);
          break;
        }
      }
      if (verbose) {
        console.log("We have (" + nb + "->) " + clients.length + " client(s) connected.");
      }
    });
 
});

// Client
var WebSocketClient = require('websocket').client;
 
var client = new WebSocketClient();
 
client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});
 
client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
    console.log('Connection Closed');
  });
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
//    console.log("Received: ", JSON.parse(message.utf8Data));
    }
  });
  
  function send(payload) {
    if (connection.connected) {
      connection.sendUTF(payload);
    }
  }

  function simulationLoop() {
    // Simulation?
    setInterval(function() {
      if (false) {
        var data = generateSomeStuff();
        connection.send(JSON.stringify({ data: data }));
      } else {
        fakeData();
        if (verbose) {
          console.log(nmea);
        }
        connection.send(JSON.stringify(nmea));
      }
    }, 1000);
  }

  simulationLoop();

});
 
client.connect('ws://localhost:' + port + '/'); //, 'tagada-protocol');

var nmea = { csp: 0.01, hum: 50, wtemp: 12, sog: 6, bat: 12.0, prmsl: 1013.0, daylog: 120, 
    lat: 37.5013, lng: -122.48091666666667, cdr: 0, dbt: 10, atemp: 19, bsp: 6, cmg: 0, twa: 0, 
    twd: 0, tws: 10, log: 9800, awa: 0, hdg: 0, cog: 0, aws: 0 };

var increment = [ 'daylog', 'log' ];
var angles    = [ 'cog', 'hdg', 'cdr', 'cmg', 'twa', 'twd', 'awa' ];
var positive  = [ 'bsp', 'sog', 'bat', 'tws', 'aws', 'dbt', 'csp', 'cog', 'hdg', 'cmg', 'twd', 'cdr' ];

var fakeData = function() {
  for (var key in nmea) {
    var val = nmea[key];
    var sign = (Math.round(Math.random()) % 2 === 0) ? 1 : -1;
    var diff = Math.random() * 0.1;
    if (increment.indexOf(key) > -1) {
      sign = 1;
    }
    if (angles.indexOf(key) > -1) {
      diff = 1;
    } 
    val += (sign * diff);
    if (angles.indexOf(key) > -1) {      
      val = val % 360;
    }
    if (positive.indexOf(key) > -1 && val < 0) {
      val = -val;
    }
    nmea[key] = val;
  }
};

var alpha = "ABCDFEGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy0123456789!@#$%^&*()_+~`{}[]|:;'<>?,./";
var len = 8;

var generateSomeStuff = function() {
  var txt = "";
  for (var i=0; i<len; i++) {
    var rnd = Math.floor(Math.random() * alpha.length);
    txt += alpha[rnd];
  }
  return txt;
};

