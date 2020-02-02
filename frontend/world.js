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
}

function manageConnectionMesssage(msg) {
  try {
    var obj = JSON.parse(msg.data);
  } catch(e) {
    console.log('This doesnt look like valid JSON');
    return;
  }
  console.log(obj);
  // TODO: Check type of message 
  //  TODO: If its a user message: Append message in chatContainer
  //  TODO: If its a user move: move that character to the specified location
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