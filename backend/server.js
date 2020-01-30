var WebSocketServer = require('websocket').server;
var http = require('http');

// GLOBAL VARIABLES
// List of current users connected to the webSocket
var users = [];
// Log of the messages sent
var history = [];

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
  var userName = false;

  // When we recieve a message from a user:
  connection.on('message', (msg) => {
    if (msg.type === 'utf8') {
      
      // If we didn't received the userName yet 
      if(userName === false) {
        userName = msg.utf8Data;
      } 
      else { // Log and send to all users the message sent by the user
        const obj = {
          author: userName,
          content: msg.utf8Data,
        };
        history.push(obj);

        users.forEach(u => {
          u.sendUTF(JSON.stringify({type: 'message', data: obj}));
        });
      }
    }
  });

  connection.on('close', (connection) => {
    console.log('User is gone');
    // Remove user from the list
    users.splice(index, 1);
  });
});