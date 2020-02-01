connection.onerror = (err) => {
  console.log('An error ocurred' + err);
}; 

connection.onmessage = (msg) => {
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
};

// Send new coordinates of the user move
var canvas = document.getElementById('myCanvas').addEventListener('click', function(e) {
  connection.send(JSON.stringify({type: 'position', posX: e.clientX, posY: e.clientY}));
});

$('#input').keydown((e) => {
  if(e.key === 'Enter') {
    var content = $('#input').val();
    connection.send(JSON.stringify({type: 'message', content: content}));
  }
});