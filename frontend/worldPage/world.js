$('#initial-screen').css('display', 'none');
connection.onmessage = (msg) => manageConnectionMesssage(msg);
connection.onerror = (err) => manageConnectionError(err);

$('.chat-form input').keydown((e) => {
  if (e.key === 'Enter') {
    sendInputMessage();
  }
});

function sendInputMessage() {
  var content = $('.chat-form input').val();
  if (isValidString(content, ['<', '>'])) {
    connection.send(JSON.stringify({
      type: 'message',
      content: content
    }));
  }

  clearInput();
  setFocusMessageInput();
}

function manageConnectionMesssage(msg) {
  let obj = JSON.parse(msg.data);
  console.log('received obj', obj);

  // After login we recieve all positions
  if (obj.type === 'positions') {
    //if he just entred we deep copy the obj.data to lastPositions to initialize it.
    if (jQuery.isEmptyObject(lastPositions)) {
      lastPositions = $.extend(true, {}, obj.data);
      //when the server sends a positions save the previous positions in lastpositions the copy the new positions in positions
    } else {
      lastPositions = $.extend(true, {}, positions);
    }
    positions = obj.data;

  }

  if (obj.type === 'message') {
    appendMessage(obj.data);
  }

  if (obj.type === 'position') {
    // Update the user position with the new data
    let author = obj.data.author;
    let posX = obj.data.posX;
    let posY = obj.data.posY;

    //Check if the user has lastposition or not and fill it 
    if (jQuery.isEmptyObject(lastPositions) || jQuery.isEmptyObject(positions[author])) {
      positions[author] = { posX, posY };
      lastPositions[author] = { posX, posY };
    } else {
      //copy the current user position to lastPositions then fill positions with incoming positios data 
      lastPositions[author] = {
        posX: positions[author].posX,
        posY: positions[author].posY
      };
    }

    positions[author] = {
      posX,
      posY
    };
  }

  if (obj.type === 'newConnection') {
    appendNotification(obj.data, 'joined');
    console.log("Hola");
  }

  if (obj.type === 'closeConnection') {
    // Remove user from the object position se we stop drawing him on the canvas
    let username = obj.data;
    delete positions[username];
    appendNotification(username, 'left');
  }

  //Call draw function only if we recieve a message to save cpu of client
  draw();
}

function manageConnectionError(err) {
  console.log('An error ocurred' + err);
}

// MESSAGE LIST
var messageList = [];
var messageUser = {};

function appendMessage(msg) {
  // Add to list of messages
  messageList.push(msg);
  messageUser[msg.author] = msg.content;

  // Create the elements to append a message
  let messageListContainer = document.getElementById('container-messages');
  let messageContainer = document.createElement('div');
  let usernameDiv = document.createElement('div');
  let textMessageP = document.createElement('p');

  // Set the attributes
  usernameDiv.innerHTML = msg.author;
  // usernameDiv.style.color = getColorById(msg.id);
  textMessageP.innerHTML = msg.content;

  // If its my message -> set class to our message, else set class to message
  msg.author === username ?
    messageContainer.className = 'our message-container' :
    messageContainer.className = 'message-container';

  usernameDiv.className = 'message-username';

  // Append the elements
  messageListContainer.appendChild(messageContainer);
  messageContainer.appendChild(usernameDiv);
  messageContainer.appendChild(textMessageP);

  // scroll bottom
  scrollElementToBottom(messageListContainer);
}

function appendNotification(username, action) {
  let text = username.bold() + ' has ' + action + ' the room.';

  // Add to list of messages
  messageList.push(text);

  // Create element
  let messageListContainer = document.getElementById('container-messages');
  let messageContainer = document.createElement('div');

  // Set attributes
  messageContainer.className = 'notification message-container';
  messageContainer.innerHTML = text;

  // Append element
  messageListContainer.appendChild(messageContainer);

  // scroll bottom
  scrollElementToBottom(messageListContainer);
}

function scrollElementToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

function setFocusMessageInput() {
  document.getElementById("write-message").focus();
}

function clearInput() {
  document.getElementById('write-message').value = '';
}
