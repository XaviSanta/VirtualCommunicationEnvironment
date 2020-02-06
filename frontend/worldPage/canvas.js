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
var walking = [2,3,4,5,6,7,8,9];

var flag = false;

var talking = [16,17];




var u  = 0;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Send new coordinates of the user move
canvas.addEventListener('click', function(e) {
  
  connection.send(JSON.stringify({type: 'position', posX: e.clientX, posY: e.clientY }));

  //animate();
});

async function animate(points,userNames,lock,currentFrame) {
        // lock function with flag to stop current animate function if it called again
        let locked = flag;
        
        var x=[];
        var y=[];

        var calcDirectionX;
        var calcDirectionY;
      
        var anim; 
        var parent;
        var rect;
        var direCoef = 0;

        parent = canvas.parentNode;
        rect = parent.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        let widthImage = 256;
        let heightImage=256;
      
       for(let i = 0; i < canvas.width/widthImage; i++)
        for(let j = 0; j < canvas.height/heightImage; j++)
          ctx.drawImage(floorImage, 256*i, 256*j);

          
        // in each iteration print all users position 
        for(var i =0; i < userNames.length;  i++){

          x[i] = points[i][currentFrame].x;
          y[i] = points[i][currentFrame].y;
        
          //Calculate the diffrence in X and Y axis to know the direction
          calcDirectionX = points[i][60].x - x[i];
          calcDirectionY = points[i][60].y - y[i];
          
          if (calcDirectionX > 0) {
             direCoef = 0;
          }
          if (calcDirectionX < 0) {
            direCoef = 2;
          }
          //if the difference of Y axis is greater then X the go up
          if (calcDirectionY > 0 && (calcDirectionY > Math.abs(calcDirectionX)) ) {
            direCoef = 1;
          }
          //if the difference of Y axis is less then X the go down
          if (calcDirectionY < 0  && (Math.abs(calcDirectionY) > Math.abs(calcDirectionX))) {
            direCoef = 3;
          }

          
          anim = walking.map(x => x + 16 * direCoef );

          // if we reach the last point from 60 frames or points then display idle 
          if (currentFrame == 60 || (calcDirectionX == 0 && calcDirectionY ==0)) {
             anim = idle;
          }
          
          
          

          
          
          renderAnimation(ctx, person, anim, x[i]-w, y[i] - 2*h, 1.5, 0, false);
             // Draw Username
          ctx.textAlign = 'center';
          ctx.font = "17px Comic Sans MS";
          ctx.fillStyle = "white";
          ctx.fillText(userNames[i], x[i]-10, y[i] - 0.3*h);
          

          
          //ctx.drawImage(image, dx, dy, dWidth, dHeight);
          // Draw last Message
          ctx.textAlign = 'center';
          ctx.font = "15px Comic Sans MS";
          ctx.fillStyle = "white";
          ctx.fillText(messageUser[userNames[i]] || '', x[i]-10, y[i] - 2*h);
      
        }
          //Go to the next point from 60 points and print all users at that point 
          currentFrame++;
          if (currentFrame < 61 && lock === flag) {
            await sleep(10);
            animate(points,userNames,locked,currentFrame);
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

//draw() function is called only if we recieve a new message containing a position
function draw() {
  
  
  var parent = canvas.parentNode;
  var rect = parent.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  // TODO: draw the 'floor'

  drawUsers();
}

function update() { 
  // TODO: This maybe we can do it as the last thing
  // TODO: Update the user list position if needed
  // TODO: Update the user characters spritesheet if they walk
}

// -------------------------------------------------------------------------------

function drawUsers() {
  //here we want to split start(x,y) end(x1,y1) into 60 points which is the path 
  var i =0;
  var points = [];
  var userNames =[];
  users = Object.keys(positions);
  users.forEach(u => {   
      //Put the splited points(path) in an array, each user has its own path
      points[i] = linePoints(lastPositions[u].posX, lastPositions[u].posY, positions[u].posX, positions[u].posY, 60);
      //Set the previous postion as new position for each user
      lastPositions[u].posX =  positions[u].posX;
      lastPositions[u].posY =  positions[u].posY;
      
      //the array contains usernames cuz we are going to to it with iteration i
      userNames[i] = u;
      i++;  
  });
  //here we change the state of flag, running animate function will detect this change and stop immediately.
  flag = !flag;
  /*Start the new animate with new path and position each time the draw() 
  called so we dont need to keep drawing until we recieve a message */
  animate(points,userNames,flag,0);
}


//This function creates a path from from start and end points it creates (frames) number of points 
function linePoints(x1, y1, x2, y2, frames) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var length = Math.sqrt(dx * dx + dy * dy);
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
