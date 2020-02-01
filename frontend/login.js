var connection;

function login() {
  var username = $('#username').val();
  var password = $('#password').val();

  connection = new WebSocket('ws://127.0.0.1:9034'); // test on localhost
  // connection = new WebSocket('ws://ecv-etic.upf.edu:9034'); // Descomentar al server machine
  
  connection.onopen = () => {
    console.log('Connection is open and ready to use');
    connection.send(JSON.stringify({username, password}));
  };
  
  connection.onerror = (err) => {
    console.log('An error ocurred' + err);
  }; 
  
  connection.onmessage = (msg) => {
    var obj = JSON.parse(msg.data);

    switch (obj.type) {
      // TODO: If its a message 'positions' we can load now the world with all the charachter in their positions
      case 'positions':
        console.log('Positions: ', obj);
        $('.container').load('world.html');
        break;

      // TODO
      case 'LoginOK':
        console.log('LoginStatus: ✅' );
        break;

      // TODO
      case 'LoginWRONG':
        console.log('LoginStatus: ❌' );

      default:
        break;
    }
  };
}