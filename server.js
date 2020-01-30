var users = [];
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer((req, res) => {
  console.log('Request:' + requestAnimationFrame.url);
  res.end('OK');
});

const port = 9034;
server.listen(port, () => console.log(`Server started on port ${port}`));

// create the server
var wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket server
wsServer.on('request', (req) => {
  var connection = req.accept(null, req.origin);
  console.log('New WebSocket User');

  connection.on('message', (msg) => {
    if (msg.type === 'utf8') {
      console.log('New MEssage: ' + msg.utf8Data);
    }
  });

  connection.on('close', (connection) => {
    console.log('User is gone');
  });
});