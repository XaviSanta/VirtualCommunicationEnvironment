var connection;

function login() {
  var username = $('#username').val();
  var password = $('#password').val();

  connection = new WebSocket('ws://ecv-etic.upf.edu/node/9034/ws/');
  
  connection.onopen = () => {
    console.log('Connection is open and ready to use');
    connection.send(JSON.stringify({type: 'login', data: {username, password}}));
  };
  
  connection.onerror = (err) => {
    console.log('An error ocurred', err);
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
        alert('Wrong password: ❌' );

      default:
        break;
    }
  };
}