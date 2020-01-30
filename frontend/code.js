// TODO: Get the username that the user input before
// Maybe save it when the user does the login and save
// it in a globalVariable
var userName = 'ChangeThis';

$(function(){
  var input = $('#input');
  // var connection = new WebSocket('ws://ecv-etic.upf.edu:9034'); // Descomentar al server machine
  // var connection = new WebSocket('ws://127.0.0.1:9034'); // test on localhost

  connection.onopen = () => {
    console.log('Connection is open and ready to use');
    connection.send(userName);
  };

  connection.onerror = (err) => {
    console.log('An error ocurred' + err);
  }; 

  connection.onmessage = (msg) => {
    try {
      var json = JSON.parse(msg.data);
    } catch(e) {
      console.log('This doesnt look like valid JSON');
      return;
    }
    console.log(json);
    // TODO: Check type of message 
    //  TODO: If its a user message: Append message in chatContainer
    //  TODO: If its a user move: move that character to the specified location
  };

  input.keydown((e) => {
    if(e.key === 'Enter') {
      var msg = $('#input').val();
      connection.send(msg);
    }
  })
});