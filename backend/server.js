var WebSocketServer = require('websocket').server;
var http = require('http');

// List of current users connected to the webSocket
var users = [];

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
  
  // Save in which position the user is in the list so we can remove easily when 
  // they disconnect
  var index = users.push(connection) - 1; 
  console.log('New WebSocket User: ' + req.origin + ' index: ' + index);
  
  // When we recieve a message from a user:
  connection.on('message', (msg) => {
    if (msg.type === 'utf8') {
      console.log('New MEssage: ' + msg.utf8Data);
    }
  });

  connection.on('close', (connection) => {
    console.log('User is gone');
    // Remove user from the list
    users.splice(index, 1);
  });
});