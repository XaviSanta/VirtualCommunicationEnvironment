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
  users = Object.keys(positions);
  users.forEach(u => {
    // // console.log(positions[u]);
    let x = positions[u].posX;
    let y = positions[u].posY - 42;
    // renderAnimation(ctx, image, anim, x, y, 1, 1, false);
    ctx.beginPath();
    ctx.rect(x, y, 50, 50);
    ctx.stroke();
  });
  // TODO: draw the users in their positions
  // Iterate through every user, and draw what in positions its stored

  // TODO: draw the messages 
}

function drawUser() {

}
function update() { // TODO: This maybe we can do it as the last thing
  // TODO: Update the user list position if needed
  // TODO: Update the user characters spritesheet if they walk
}

// -------------------------------------------------------------------------------
var idle = [0];
var walking = [2,3,4,5,6,7,8,9];
// Print sprite 
function renderAnimation( ctx, image, anim, x, y, scale, offset, flip ) {
	offset = offset || 0;
	var t = Math.floor(performance.now() * 0.001 * 10);
	renderFrame( ctx, image, anim[ t % anim.length ] + offset, x,y,scale,flip);
}

function renderFrame(ctx, image, frame, x, y, scale, flip) {
	var w = 32; //sprite width
	var h = 64; //sprite height
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
	ctx.drawImage( frame, xf,yf,w,h, 0,0,w*scale,h*scale );
	ctx.restore();
}
