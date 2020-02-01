// FIREBASE
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyB_bCF4WzHJeV8AQ6vBwtP_5seeteIxfis",
  authDomain: "chat-5ea5c.firebaseapp.com",
  databaseURL: "https://chat-5ea5c.firebaseio.com",
  projectId: "chat-5ea5c",
  storageBucket: "chat-5ea5c.appspot.com",
  messagingSenderId: "848769946366",
  appId: "1:848769946366:web:c636f9013d5bedc0598baf",
  measurementId: "G-RN2LNY0C6S"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference messages collection
var messagesRef = firebase.database().ref('messages');
var userPositionsRef = firebase.database().ref().child('userPositions');


// GLOBAL VARIABLES
// List of current users connected to the webSocket
var users = [];
// Log of the messages sent
var history = [];
var positions = [];

userPositionsRef.on('value', snap => positions = snap.val());
messagesRef.on('value', gotMessages, errData => console.log('Error', errData));

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

/////////////////////////////////////////////////////////////////////////
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer((req, res) => {
  console.log('Request:' + req.url);
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
  var username = false;
  var password;
  var index;

  // When we recieve a message from a user:
  connection.on('message', (msg) => {
    if (msg.type === 'utf8') {
      msg = JSON.parse(msg.utf8Data);
      
      // If we didn't received the username yet 
      if(username === false) {
        // Save in which position the user is in the list so we can remove easily when they disconnect
        index = users.push(connection) - 1; 
        console.log('New WebSocket User: ' + req.origin + ' index: ' + index);
        
        connection.send(JSON.stringify({type: 'LoginOK'}));
        
        // If username is in DB -> Send location of the character
        username = msg.username;
        password = msg.password;
        let posX, posY;
        
        if(positions == null || positions[username] === undefined) {
          posX = posY = 0;
        } else {
          console.log('get coordinates from DB');
          posX = positions[username].posX;
          posY = positions[username].posY;
        }

        // Update positions DB
        userPositionsRef.child(username).set({author: username, posX:posX, posY:posY}); 
        
        // Send all positions to the user who connected now
        connection.send(JSON.stringify({type: 'positions', data: positions}));
      } 

      else { 
        switch (msg.type) {
          // If its a message: Log and send to all users the message sent by the user
          case 'message':
            const obj = {
              author: username,
              content: msg.content,
            };
            history.push(obj);
            saveMessage(obj);
    
            users.forEach(u => {
              u.sendUTF(JSON.stringify({type: 'message', data: obj}));
            });
            break;

          // If its a position: Update DB of positions and broadcast to all users
          case 'position':
            // Create obj position
            var newPos = {author:username, posX:msg.posX, posY:msg.posY};

            // Update DB
            userPositionsRef.child(username).set(newPos);

            // Broadcast position updated
            users.forEach(u => {
              u.send(JSON.stringify({type: 'position', data: newPos}));
            });

          default:
            break;
        }
      }
    }
  });

  connection.on('close', (connection) => {
    console.log('User is gone');
    // Remove user from the list
    users.splice(index, 1);
  });
});