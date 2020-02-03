$('#initial-screen').css('display', 'none');
connection.onmessage = (msg) => manageConnectionMesssage(msg);
connection.onerror = (err) => manageConnectionError(err);

$('.chat-form input').keydown((e) => {
  if(e.key === 'Enter') {
    sendInputMessage();
  }
});

function sendInputMessage() {
  var content = $('.chat-form input').val();
  connection.send(JSON.stringify({type: 'message', content: content}));
  clearInput();
  setFocusMessageInput();
}

function manageConnectionMesssage(msg) {
  var obj = JSON.parse(msg.data);
  console.log('received obj', obj);

  if(obj.type === 'positions') {
    positions = obj.data;
  }

  if(obj.type === 'message') {
    appendMessage(obj.data);
  }

  if(obj.type === 'position') {
    // Update the user position with the new data
    let author = obj.data.author;
    let posX = obj.data.posX;
    let posY = obj.data.posY;

    positions[author] = {posX, posY};
    console.log('Updatedpositions', positions);
  }
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

function scrollElementToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

function setFocusMessageInput(){
  document.getElementById("write-message").focus();
}

function clearInput() {
  document.getElementById('write-message').value = '';
}