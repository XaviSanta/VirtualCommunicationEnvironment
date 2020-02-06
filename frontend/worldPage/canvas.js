var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
var floorImage = new Image();
floorImage.src = '../images/floor.png';
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
var walking = [2,3,4,5,6,7,8,9];
var currentFrame = 0;
var flag = false;

var talking = [16,17];


//var points = [0]; 
var u = 0;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Send new coordinates of the user move
canvas.addEventListener('click', function(e) {
  
  connection.send(JSON.stringify({type: 'position', posX: e.clientX, posY: e.clientY }));

  //animate();
});

async function animate(points,userNames,lock) {
  let locked = flag;
  var x=[];
  var y=[];

  var calcDirectionX;
  var calcDirectionY;

  var anim; 
  var parent;
  var rect;
  var direCoef = 0;
  // TODO: If user is moving;

  console.log('x:',userNames.length);
  parent = canvas.parentNode;
  rect = parent.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  for(var i =0; i < userNames.length;  i++){
    x[i] = points[i][currentFrame].x;
    y[i] = points[i][currentFrame].y;
    
    calcDirectionX = points[i][60].x - x[i];
    calcDirectionY = points[i][60].y - y[i];
    
    if (calcDirectionX > 0) {
      direCoef = 0;
    }
    if (calcDirectionX < 0) {
      direCoef = 2;
    }
    if (calcDirectionY > 0 && (calcDirectionY > Math.abs(calcDirectionX)) ) {
      direCoef = 1;
    }
    if (calcDirectionY < 0  && (Math.abs(calcDirectionY) > Math.abs(calcDirectionX))) {
      direCoef = 3;
    }

    console.log('calc:',currentFrame);
    anim = walking.map(x => x + 16 * direCoef );
    
    if (currentFrame == 60 || (calcDirectionX == 0 && calcDirectionY ==0)) {
        anim = idle;
    }

    console.log('x:',x[i]);
    
    renderAnimation(ctx, person, anim, x[i]-w, y[i] - 2*h, 1.5, 0, false);
    
    // Draw Username
    ctx.textAlign = 'center';
    ctx.fillText(userNames[i], x[i], y[i] - 0.3*h);

    // Draw last Message
    ctx.fillText(messageUser[userNames[i]] || '', x[i], y[i] - 2*h);

  }
    
  currentFrame++;
  if (currentFrame < 61 && lock === flag) {
    await sleep(10);
    animate(points,userNames,locked);
  }
          
}

var last = performance.now();

function loop() {
  
  var now = performance.now();
  var elapsed_time = (now-last) / 1000;
  last = now;
  update(elapsed_time);
  requestAnimationFrame( loop );
}

loop();
    
//start loop
function draw() {
  currentFrame = 0;
  var parent = canvas.parentNode;
  var rect = parent.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  // TODO: draw the 'floor'
  drawFloor();
  drawUsers();
}

function update() { 
  // TODO: This maybe we can do it as the last thing
  // TODO: Update the user list position if needed
  // TODO: Update the user characters spritesheet if they walk
}

// -------------------------------------------------------------------------------
function drawFloor() {
  let widthImage = 256;
  let heightImage = 256;
  for(let i = 0; i < canvas.width/widthImage; i++)
    for(let j = 0; j < canvas.height/heightImage; j++) 
      ctx.drawImage( floorImage, 256*i, 256*j);
}

function drawUsers() {
  var i = 0;
  var points = [];
  var userNames =[];
  users = Object.keys(positions);
  users.forEach(u => {   
    points[i] = linePoints(lastPositions[u].posX, lastPositions[u].posY, positions[u].posX, positions[u].posY, 60);
    lastPositions[u].posX = positions[u].posX;
    lastPositions[u].posY = positions[u].posY;
    console.log('x:',points[i]);
    userNames[i] = u;
    i++;  
  });

  flag = !flag;
  animate(points,userNames,flag);
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
