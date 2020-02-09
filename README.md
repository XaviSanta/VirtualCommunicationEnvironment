# Virtual Communication Environment 
Chat2

Imane Khider 196341
Xavier Santamaria 

For this assigment we have improved the chat of the first assigment by creating our own server using node.js.
We have a virtual space where we are representing each user visualy. 

Frontend part :

We have used three js and css libraries : JQuery, bootstrap and fontawsome. It includes also our style.

In the login page we have two parts, the first part is for the login page and the second one for the world page.
The login page the user have to enter the name and the password and here we have three cases:
First case: if the user doesn’t exist in the DB, the system register automatically the new user in the DB.
Second case: if the user name exists in the DB and the password is wrong, the system reject the operation and tell the user that the password is incorrect.
Third case: if the user name exists and the credentials are correct, the login is successful and the user can enter to the chat.
The world page will appear and the login page will disappear.  
The world page contains three sections, the first section is for writing and sending messages between users, the second is for displaying all users messages and the third one is for displaying animations of the sprites.
The world page is based on three js files which are login.js, world.js and canvas.js 
Explaining the role of each js file and its important functions:

Login.js:

It contains two functions which are login function and isValideString function.
Login function: it gets the user name and password from the form and pass them to the function of isValideString to check if they are empty or contains not allowed characters than connect to the webSoket than it sends the credentials to the server and we parse the response from the server and we check the type if it is Login OK or it is Login Wrong, if it OK we load the world page and the user can enter the chat otherwise we display an alert that says that the password is wrong.

World.js:

The functions of this document handles the response from the server and the requests from the client.
It contains 5 functions :
sendInputMessage() : it sends the message from the client to the server.
manageConnectionMessage(msg):  it parse the messages coming from the server. We have 6 types of messages coming from the server: positions(get positions of all users), message(it takes the message that it receive and insert it the section of displaying messages in the world page), messagesLog(Not fully implemented), position(when a user change his position we receive his new position and we set his last position as current position and new position as the received position), newConnection(We notify a new connection of a user), closeConnection(Remove the user from the canvas and send the notification that the user has left). After parsing and treating the response messages from the server we call the draw function which will be explained lately.
ManageconnectionError(): if an error occurred between the server and client we print it in the console log.
AppendMessage(): it append the messages to the displaying section in the world page.

Canvas.js:

The functions of this document are for the animation and the performance of the users. It contains:

canvas.addEventListener(): if the user changes his position clicks somewhere in the canvas, this function gets x and y position and send it to the server.
draw(): it is called if we receive a response from the server, it calls drawUsers function. 
linePoints(): it creates a path from two points, the last position and the targeted position, this path contains 60 points created fro the two points.  
drawUsers(): it draws all users in the canvas. It calls linePoints and animate functions.
resizeCanvas(): it clears/ resizes all the canvas 
drawFloor(): it draws the floor/background of the canvas. 
drawNumConnections(): it draws how many users are connected in the canvas at a fixed position. 
drawName(): it draws the user name below the sprite.
drawLastMessage(): it draws the last message above each user that sends it.
getCharacters(): it returns an array of sprites images.
getDirection(): it returns the direction coefficient which will be used to draw the sprite the desired direction. 
sleep(): wait for an amount of time in ms between each point from the line points array which are 60, we use it the async function animate. It will be called 60 times.
renderFrame():  it prints the sprites.
renderAnimation(): it prints the sprites.
getAnimation(): it returns the the state of the sprite.
printAllUsersPosition(): for each point from the 60 points in the line that we get from linePoints we draw its sprite, name and last message in each movement.
animate(): we set it as an asynchronous function to avoid the stop that can happens to the code during the execution of this function. It contains a lock parameter to stop the current execution of the running animate function when it is called again.
This function will call itself 60 times based on numFrames which we have set it in 60 and each time it will sleep for 10ms, in each time when it calls itself it will clear the canvas, draw the floor, print all user position at that frame and draw the number of connections. 
