var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
// Send new coordinates of the user move
canvas.addEventListener('click', function(e) {
  connection.send(JSON.stringify({type: 'position', posX: e.clientX, posY: e.clientY}));
});

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
  // TODO: draw the 'floor'

  // TODO: draw the users in their positions
  // TODO: draw the messages 
}

function update() { // TODO: This maybe we can do it as the last thing
  // TODO: Update the user list position if needed
  // TODO: Update the user characters spritesheet if they walk
}