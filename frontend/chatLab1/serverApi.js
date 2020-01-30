var server = new SillyClient();

// When receiving a message, process the message depending the type of message
server.on_message = function(author_id, msg) {
  let messageObject = JSON.parse(msg);
  switch (messageObject.type) {
    case 'message':
      appendMessage(messageObject);
      break;
    case 'request':
      processRequest(author_id);
      break;
    case 'log':
      processLog(messageObject);
      break;
    case 'hello':
      processHello(author_id, messageObject);
      break;
    case 'hello2':
      processHello2(author_id, messageObject);
      break;
    default:
      break;
  }
}

// type request: Is a request for the log of messages from: the new user, to: the oldest in the room
// The oldest now will send a msg type log to the new user
function processRequest(author_id) {
  let msg = {
    type: 'log',
    messages: messageList,
  }
  msg = JSON.stringify(msg);
  server.sendMessage(msg, author_id);
}

// The new user receives the log (list of messages) and add them into the interface
function processLog(msg) {
  msg.messages.forEach(m => {
    if (m.type === 'message') {
      appendMessage(m);
    }

    if (m.type === 'notification') {
      appendNotification(m)
    }
  });

  // When all the messages finished, append our message so we know 
  // in which moment we joined the conversation
  appendNotification(setNotification(my_id, 'joined'));
}

function processHello(author_id, msg) {
  let id = author_id;
  let username = msg.username;
  userDict[id] = username; // Add new entry to our 'dictionary'
  let hello2 = {
    type: 'hello2',
    username: my_username,
  }

  hello2 = JSON.stringify(hello2);
  server.sendMessage(hello2, id);
}

function processHello2(author_id, msg) {
  userDict[author_id] = msg.username;

  // Show user has joined the room in the screen
  let n = setNotification(author_id, 'joined');
  appendNotification(n);
}

server.on_ready = function(id) {
  my_id = id;
  document.getElementById('chat-container').style.display = 'block';     // Show chat
  document.getElementById('user-icon').style.color = getColorById(id); // Change icon color
  userDict[id] = my_username;
  setFocusMessageInput();
}

// Get the lowestId in the room and request for the log of messages
server.on_room_info = function(info) {
  usersConnected = info.clients.length;
  $("#usersConnected").text(usersConnected);
  
  let lowestId = Math.min.apply(Math, info.clients);
  if(lowestId != my_id) {
    let msg = {
      type: 'request',
    }

    msg = JSON.stringify(msg);
    server.sendMessage(msg, lowestId);
  }
  else {
    appendNotification(setNotification(my_id, 'joined'));
  }

}

// When new user connected we want to know the username of that id and print it in screen
// so first we will say hello to the new user and wait the response containing the username
server.on_user_connected = function (user_id) {
  usersConnected++;
  $("#usersConnected").text(usersConnected);

  let msg = {
    type: 'hello',
    username: my_username,
  }

  msg = JSON.stringify(msg);
  server.sendMessage(msg, user_id);

}

// When user disconnects we want to notify the other ones that this user left the chat
server.on_user_disconnected = function (user_id) {
  usersConnected--;
  $("#usersConnected").text(usersConnected);

  let n = setNotification(user_id, 'left');
  appendNotification(n);
}

//this method is called when coulndt connect to the server
server.on_error = function(err) {
  alert('An error ocurred. Server returned error');
  console.table(err);
};

//this methods is called when the server gets closed (it shutdowns)
server.on_close = function(){
  alert('Server is closed');
};