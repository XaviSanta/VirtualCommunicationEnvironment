// Require (Firebase, websocket, http)
var firebase = require("firebase");
var firebaseConfig = require('./firebaseConfig');
var WebSocketServer = require('websocket').server;
var http = require('http');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global variables
var users;            // User Database from firebase
var connections = []; // List of connections users connected to the webSocket
var history = [];     // Log of the messages sent

// References
var usersRef = firebase.database().ref().child('users');
var messagesRef = firebase.database().ref('messages');

// When database is updated:
usersRef.on('value', data => users = data.val());
messagesRef.on('value', data => history = data.val());

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
    if (msg.type === 'utf8') {
      msg = JSON.parse(msg.utf8Data);
       
      switch (msg.type) {
        case 'login':
          // Save in which position the user is in the list so we can remove easily when they disconnect
          index = connections.push(connection) - 1; 
          manageLogin(username = msg.data.username, msg.data.password, connection);
          console.log('New WebSocket User: ' + req.origin + ' index: ' + index);
          break;

        // If its a message: Log and send to all connections the message sent by the user
        case 'message':
          const obj = {author: username, content: msg.content};
          // Save 
          saveMessage(obj);

          // Send
          broadcastMessage(obj);
          break;

        // If its a position: Update DB of positions and broadcast to all connections
        case 'position':
          updateUserPosition(username, msg.posX, msg.posY, msg.direction);

          break;
        case 'getPositions':
          sendAllPositionsToUser(connection);
          break;

        case 'getMessages':
          sendAllMessagesToUser(connection);
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

function manageLogin(username, password, connection) {
  // If doesn't exist, add to database
  if(!isUserRegistered(username)) {
    savePasswordInDB(username, password);
    updateUserPosition(username, 0, 0); 
    setUserIsConnected(username, true);
    sendLoginStatus(connection, 'LoginOK');
  } else {
    // If exists -> check password
    if(password !== users[username].password) {
      sendLoginStatus(connection, 'LoginWRONG');
    } else {
      sendLoginStatus(connection, 'LoginOK');
      setUserIsConnected(username, true);
      position = getUserPosition(username);
      updateUserPosition(username, position.posX, position.posY);
    } 
  }
}

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
    var messagesLog = data.val();
    var keys = Object.keys(messages);
    keys.forEach(k => {
      // TODO: do something maybe
      // console.log(messages[k]);
    });
  }
}

function saveMessage(obj) {
  var newMessageRef = messagesRef.push();
  newMessageRef.set(obj);

  usersRef.child(`${obj.author}/lastMessage`).set(obj.content); 
}

function broadcastMessage(obj) {
  connections.forEach(u => {
    u.sendUTF(JSON.stringify({type: 'message', data: obj}));
  });
}

function isUserRegistered(username) {
  try {
    return users !== null && users[username] !== undefined;
  } catch(e) {
    console.log(e)
  }
  return false;
}

function savePasswordInDB(username, password) {
  usersRef.child(username).set({password});
}

function setUserIsConnected(username, connected) {
  usersRef.child(`${username}/connected`).set(connected);

  // Broadcast
  let type = connected ? 'newConnection' : 'closeConnection';
  connections.forEach(u => {
    u.sendUTF(JSON.stringify({type: type, data: username}));
  });
}

function sendAllPositionsToUser(connection) {
  connection.send(JSON.stringify({type: 'positions', data: getOnlinePositions()}));
}

function sendAllMessagesToUser(connection) {
  connection.send(JSON.stringify({type: 'messagesLog', data: history}));
}

function sendLoginStatus(connection, status) {
  connection.send(JSON.stringify({type: status}));
}

function updateUserPosition(username, posX, posY, direction = 'idle') {
  // Update DATABASE
  usersRef.child(`${username}/position`).set({posX:posX, posY:posY}); 
  usersRef.child(`${username}/direction`).set(direction); 

  // Broadcast to all users the new position of the user
  let data = {author: username, posX, posY, direction};
  connections.forEach(u => {
    u.send(JSON.stringify({type: 'position', data}));
  });
}