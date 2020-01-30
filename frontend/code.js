var userName = 'ChangeThis';

$(function(){
  var input = $('#input');
  // var connection = new WebSocket('ws://ecv-etic.upf.edu:9034'); // Descomentar al server machine
  var connection = new WebSocket('ws://127.0.0.1:9034'); // test on localhost

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
    console.log('Received message');
    console.log(json);
  };

  input.keydown((e) => {
    if(e.key === 'Enter') {
      var msg = $('#input').val();
      connection.send(msg);
    }
  })
});