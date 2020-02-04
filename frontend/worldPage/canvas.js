var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
var person = new Image();
person.src = '../images/man1-spritesheet.png';
characters = [
  '../images/man1-spritesheet.png', 
  '../images/man2-spritesheet.png', 
  '../images/man3-spritesheet.png',
  '../images/man4-spritesheet.png',
  '../images/woman1-spritesheet.png',
  '../images/woman2-spritesheet.png',
  '../images/woman3-spritesheet.png',
  '../images/woman4-spritesheet.png',
];
var w = 32; //sprite width
var h = 64; //sprite height
var idle = [16];
var talking = [16,17];
var walking = [2,3,4,5,6,7,8,9];
var currentFrame = 0;
var points;
var lastX = 0;
var lastY = 0;

// Send new coordinates of the user move
canvas.addEventListener('click', function(e) {
  lastX = positions[username].posX;
  lastY = positions[username].posY;

  points = linePoints(lastX, lastY, e.clientX, e.clientY, 60);
  currentFrame = 0;
  
  lastX = e.clientX;
  lastY = e.clientY;
  animate();
});

function animate() {
  var point = points[currentFrame++];
  connection.send(JSON.stringify({type: 'position', posX: point.x, posY: point.y, direction: 'right'}));

  // refire the timer until out-of-points
  if (currentFrame < points.length) {
      timer = setTimeout(animate, 1000 / 60);
  }

  // Send that the user has stopped
  if(currentFrame == points.length) {
    connection.send(JSON.stringify({type: 'position', posX: point.x, posY: point.y, direction: 'idle'}));
  }
}

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
  drawUsers();
}

function update() { // TODO: This maybe we can do it as the last thing
  // TODO: Update the user list position if needed
  // TODO: Update the user characters spritesheet if they walk
}

// -------------------------------------------------------------------------------
function drawUsers() {
  users = Object.keys(positions);
  users.forEach(u => {
    drawUser(u);
  });
}

function linePoints(x1, y1, x2, y2, frames) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var length = Math.sqrt(dx * dx + dy * dy);
  var incrementX = dx / frames;
  var incrementY = dy / frames;
  var a = new Array();

  a.push({
      x: x1,
      y: y1
  });
  for (var frame = 0; frame < frames - 1; frame++) {
      a.push({
          x: x1 + (incrementX * frame),
          y: y1 + (incrementY * frame)
      });
  }
  a.push({
      x: x2,
      y: y2
  });
  return (a);
}


function drawUser(u) {
  // TODO: If user is moving;
  let x = positions[u].posX;
  let y = positions[u].posY;
  let dir = positions[u].dir || 'idle';
  let anim; 
  if(dir === 'idle') anim = idle;
  else {
    let i;
    if(dir === 'right') i = 0;
    if(dir === 'down')  i = 1;
    if(dir === 'left')  i = 2;
    if(dir === 'up')    i = 3;
    anim = walking.map(x => x + 16 * i );
  }

  renderAnimation(ctx, person, anim, x-w, y - 2*h, 1.5, 0, false);

  // Draw Username
  ctx.textAlign = 'center';
  ctx.fillText(u, x, y - 0.3*h);

  // Draw last Message
  ctx.fillText(messageUser[u] || '', x, y - 2*h);
}

// Print sprite 
function renderAnimation( ctx, image, anim, x, y, scale, offset, flip ) {
  offset = offset || 0;
  var t = Math.floor(performance.now() * 0.001 * 10);
  renderFrame( ctx, image, anim[ t % anim.length ] + offset, x,y,scale,flip);
}

function renderFrame(ctx, image, frame, x, y, scale, flip) {
  scale = scale || 1;
  var num_hframes = image.width / w;
  var xf = (frame * w) % image.width;
  var yf = Math.floor(frame / num_hframes) * h;
  ctx.save();
  ctx.translate(x,y);
  if( flip ) {
    ctx.translate(w*scale,0);
    ctx.scale(-1,1);
  }
  ctx.drawImage( image, xf,yf,w,h, 0,0,w*scale,h*scale );
  ctx.restore();
}
