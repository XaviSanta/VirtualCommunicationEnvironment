var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
var person = new Image();
person.src = '../images/man1-spritesheet.png';
var floorImage = new Image();
floorImage.src = '../images/floor.png';
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
var walking = [2, 3, 4, 5, 6, 7, 8, 9];
var flag = false;
var talking = [16, 17];
var numFrames = 100;

// Send new coordinates of the user move
canvas.addEventListener('click', function (e) {
  connection.send(JSON.stringify({
    type: 'position',
    posX: e.clientX,
    posY: e.clientY
  }));
});

//draw() function is called only if we recieve a new message containing a position
function draw() {
  drawUsers();
}

function drawUsers() {
  //here we want to split start(x,y) end(x1,y1) into 60 points which is the path 
  let users = Object.keys(positions);
  users.forEach(u => {
    //Put the splited points(path) in an array, each user has its own path
    positions[u]['points'] = linePoints(lastPositions[u], positions[u], numFrames);
    //Set the previous postion as new position for each user
    lastPositions[u].posX = positions[u].posX;
    lastPositions[u].posY = positions[u].posY;
  });

  //here we change the state of flag, running animate function will detect this change and stop immediately.
  flag = !flag;

  /*Start the new animate with new path and position each time the draw() 
  called so we dont need to keep drawing until we recieve a message */
  animate(flag, 0);
}

// This function is called 60 times when we receive a message
async function animate(lock, currentFrame) {
  resizeCanvas();
  drawFloor();
  drawNumConnections();
  printAllUsersPosition(currentFrame);
  
  //Go to the next point from 'numFrames' points and print all users at that point 
  currentFrame++;
  if (currentFrame <= numFrames && lock === flag) {
    await sleep(10);
    animate(flag, currentFrame);
  }
}

function resizeCanvas() {
  var parent;
  var rect;
  parent = canvas.parentNode;
  rect = parent.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

function drawFloor() {
  let widthImage = 256;
  let heightImage = 256;

  for (let i = 0; i < canvas.width / widthImage; i++)
    for (let j = 0; j < canvas.height / heightImage; j++)
      ctx.drawImage(floorImage, widthImage * i, heightImage * j);
}

function drawNumConnections() {
  ctx.textAlign = 'left';
  ctx.font = "17px Comic Sans MS";
  ctx.fillStyle = "white";
  let text = `Users connected: ${Object.keys(positions).length}`;
  ctx.fillText(text, 20, 25);
}

function printAllUsersPosition(currentFrame) {
  let users = Object.keys(positions);
  users.forEach(u => {
    let points = positions[u].points;
    let x = points[currentFrame].x;
    let y = points[currentFrame].y;

    //Calculate the diffrence in X and Y axis to know the direction
    var anim = getAnimation(x, y, points, currentFrame);
    renderAnimation(ctx, person, anim, x - w, y - 2 * h, 1.5, 0, false);
    
    drawName(u, x, y);
    drawLastMessage(u, x, y);
  });
}

function getAnimation(x, y, points, currentFrame ) {
  let calcDirectionX = points[numFrames].x - x;
  let calcDirectionY = points[numFrames].y - y;

  // if we reach the last point from 60 frames or points then display idle 
  if (currentFrame == numFrames || (calcDirectionX == 0 && calcDirectionY == 0)) {
    return idle;
  } 

  let direCoef = getDirection(calcDirectionX, calcDirectionY);
  return walking.map(i => i + 16 * direCoef);
}

function getDirection(calcDirectionX, calcDirectionY) {
  if (calcDirectionX > 0) {
    direCoef = 0; // Right
  }
  if (calcDirectionX < 0) {
    direCoef = 2; // Left
  }
  //if the difference of Y axis is greater then X the go up
  if (calcDirectionY > 0 && (calcDirectionY > Math.abs(calcDirectionX))) {
    direCoef = 1; // Up
  }
  //if the difference of Y axis is less then X the go down
  if (calcDirectionY < 0 && (Math.abs(calcDirectionY) > Math.abs(calcDirectionX))) {
    direCoef = 3; // Down
  }

  return direCoef;
}

//This function creates a path from from start and end points it creates (frames) number of points 
function linePoints(lastPos, pos, frames) {
  var x1 = lastPos.posX;
  var y1 = lastPos.posY;
  var x2 = pos.posX;
  var y2 = pos.posY;
  var dx = x2 - x1;
  var dy = y2 - y1;
  var incrementX = dx / frames;
  var incrementY = dy / frames;
  var a = new Array();

  // Push start
  a.push({
    x: x1,
    y: y1
  });
  //push 58 points if frames are 60 e
  for (var frame = 0; frame < frames - 1; frame++) {
    a.push({
      x: x1 + (incrementX * frame),
      y: y1 + (incrementY * frame)
    });
  }
  // Push end 
  a.push({
    x: x2,
    y: y2
  });
  // Return a json object containing the path points 
  return (a);
}

// Print sprite 
function renderAnimation(ctx, image, anim, x, y, scale, offset, flip) {
  offset = offset || 0;
  var t = Math.floor(performance.now() * 0.001 * 10);
  renderFrame(ctx, image, anim[t % anim.length] + offset, x, y, scale, flip);
}

function drawName(u, x, y) {
  ctx.textAlign = 'center';
  ctx.font = "17px Comic Sans MS";
  ctx.fillStyle = "white";
  ctx.fillText(u, x - 10, y - 0.3 * h);
}

function drawLastMessage(u, x, y) {
  ctx.textAlign = 'center';
  ctx.font = "15px Comic Sans MS";
  ctx.fillStyle = "white";
  ctx.fillText(messageUser[u] || '', x - 10, y - 2 * h);
}

function renderFrame(ctx, image, frame, x, y, scale, flip) {
  scale = scale || 1;
  var num_hframes = image.width / w;
  var xf = (frame * w) % image.width;
  var yf = Math.floor(frame / num_hframes) * h;
  ctx.save();
  ctx.translate(x, y);
  if (flip) {
    ctx.translate(w * scale, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(image, xf, yf, w, h, 0, 0, w * scale, h * scale);
  ctx.restore();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}