var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
var person = new Image();
person.src = '../images/javi-spritesheet.png';
var w = 32; //sprite width
var h = 64; //sprite height
var idle = [0];
var walking = [2,3,4,5,6,7,8,9];

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
  drawUsers();
  // TODO: draw the messages 
  drawMessages();
}



function update() { // TODO: This maybe we can do it as the last thing
  // TODO: Update the user list position if needed
  // TODO: Update the user characters spritesheet if they walk
}

// -------------------------------------------------------------------------------
function drawMessages() {

}

function drawUsers() {
  users = Object.keys(positions);
  users.forEach(u => {
    drawUser(u);
  });
}

function drawUser(u) {
  // TODO: If user is moving;
  let x = positions[u].posX - w;
  let y = positions[u].posY - 2*h;
  renderAnimation(ctx, person, walking, x, y, 1.5, 0, false);
  ctx.textAlign = 'center';
  ctx.fillText(u, x + w, y);
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
