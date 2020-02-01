// Require (Firebase, websocket, http)
var firebase = require("firebase");
var firebaseConfig = require('./firebaseConfig');
var WebSocketServer = require('websocket').server;
var http = require('http');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global variables
var users; // User Database from firebase
var connections = []; // List of connections users connected to the webSocket
var history = []; // Log of the messages sent

// References
var usersRef = firebase.database().ref().child('users');
var messagesRef = firebase.database().ref('messages');

// When database is updated:
usersRef.on('value', data => users = data.val());
messagesRef.on('value', gotMessages);

// Http server
var server = http.createServer();
const port = 9034;
server.listen(port, () => console.log(`Server started on port ${port}`));

// WebSocket
var wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket on request
wsServer.on('request', (req) => {
  var connection = req.accept(null, req.origin);
  var username = false;
  var index;
  
  // When we recieve a message from a user:
  connection.on('message', (msg) => {
    var posX, posY;
    var password;

    if (msg.type === 'utf8') {
      msg = JSON.parse(msg.utf8Data);
       
      switch (msg.type) {
        // If we didn't received the username yet 
        case 'login':
          // Save in which position the user is in the list so we can remove easily when they disconnect
          index = connections.push(connection) - 1; 
          console.log('New WebSocket User: ' + req.origin + ' index: ' + index);
          
          // If username is in DB -> Send location of the character
          username = msg.data.username;
          password = msg.data.password;
          
          // If doesn't exist, add to database
          if(!isUserRegistered(username)) {
            savePasswordInDB(username, password);
            updateUserPositionDB(username, 0, 0); 
            setUserIsConnected(username, true);
            sendAllPositionsToUser(connection);
          } else {
            // Check password
            if(password !== users[username].password) {
              sendLoginStatus(connection, 'LoginWRONG');
            } else {
              sendLoginStatus(connection, 'LoginOK');
              setUserIsConnected(username, true);
              position = getUserPosition(username);
              updateUserPositionDB(username, position.posX, position.posY);
              sendAllPositionsToUser(connection);
            } 
          }
          break;
        // If its a message: Log and send to all connections the message sent by the user
        case 'message':
          const obj = {
            author: username,
            content: msg.content,
          };
          history.push(obj);
          saveMessage(obj);
  
          connections.forEach(u => {
            u.sendUTF(JSON.stringify({type: 'message', data: obj}));
          });
          break;

        // If its a position: Update DB of positions and broadcast to all connections
        case 'position':
          updateUserPositionDB(username, msg.posX, msg.posY);

        default:
          break;
      }
      
    }
  });

  connection.on('close', (connection) => {
    console.log('User is gone');
    setUserIsConnected(username, false);

    // Remove user from the list
    connections.splice(index, 1);
  });
});


// FUNCTIONS

function getOnlinePositions() {
  // Send positions of all connected people
  let positions = {};

  Object.keys(users).forEach(username => {
    if(users[username].connected === true) {
      positions[username] = users[username].position;
    }
  });

  return positions;
}

function getUserPosition(username) {
  let positions = getOnlinePositions();
  let posX, posY;
  if(positions == null || positions[username] === undefined) {
    posX = posY = 0;
  } else {
    posX = positions[username].posX;
    posY = positions[username].posY;
  }

  return {posX, posY};
}

function gotMessages(data) {
  if(data.val() === null){
    console.log('No messages');
  }
  else {
    var messages = data.val();
    var keys = Object.keys(messages);
    keys.forEach(k => {
      // TODO
      // console.log(messages[k]);
    });
  }
}

function saveMessage(obj) {
  var newMessageRef = messagesRef.push();
  newMessageRef.set(obj);
}

function isUserRegistered(username) {
  return users !== null && users[username] !== undefined;
}

function savePasswordInDB(username, password) {
  usersRef.child(username).set({password});
}

function setUserIsConnected(username, connected) {
  usersRef.child(`${username}/connected`).set(connected);
}

function sendAllPositionsToUser(connection) {
  connection.send(JSON.stringify({type: 'positions', data: getOnlinePositions()}));
}

function sendLoginStatus(connection, status) {
  connection.send(JSON.stringify({type: status}));
}

function updateUserPositionDB(username, posX, posY) {
  usersRef.child(`${username}/position`).set({posX:posX, posY:posY}); 

  // Broadcast to all users the new position of the user
  let data = {author: username, posX, posY};
  connections.forEach(u => {
    u.send(JSON.stringify({type: 'position', data}));
  });
}