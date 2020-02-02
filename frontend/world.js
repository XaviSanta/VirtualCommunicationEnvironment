$('#initial-screen').css('display', 'none');
connection.onmessage = (msg) => manageConnectionMesssage(msg);
connection.onerror = (err) => manageConnectionError(err);

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
// Send new coordinates of the user move
canvas.addEventListener('click', function(e) {
  connection.send(JSON.stringify({type: 'position', posX: e.clientX, posY: e.clientY}));
});

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
  console.log(obj);

  if(obj.type === 'message') {
    appendMessage(obj.data);
  }

  if(obj.type === 'position') {
    // TODO: move that character to the specified location
  }
}

function manageConnectionError(err) {
  console.log('An error ocurred' + err);
}
// DRAWING ----------------------------------------------------------------------------------
var last = performance.now();

function loop() {
  draw();
  var now = performance.now();
  var elapsed_time = (now-last) / 1000;
  last = now;
  update(elapsed_time);
  requestAnimationFrame( loop );
}

//start loop
loop();
function draw() {
  var parent = canvas.parentNode;
  var rect = parent.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

function update() {

}

// MESSAGE LIST
function appendMessage(msg) {
  // Add to list of messages
  // messageList.push(msg);

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