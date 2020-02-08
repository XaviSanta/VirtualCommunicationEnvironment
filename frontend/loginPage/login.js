var connection;
var username;
var positions = {};

function login() {
  username = $('#username').val();
  var password = $('#password').val();

  if(!isValidString(username) || !isValidString(password)) {
    return false;
  }

  // connection = new WebSocket('wss://ecv-etic.upf.edu/node/9034/ws/');
  connection = new WebSocket('ws://127.0.0.1:9034');
  
  connection.onopen = () => {
    console.log('Connection is open and ready to use');
    if(isValidString(username) && isValidString(password)) {
      connection.send(JSON.stringify({type: 'login', data: {username, password}}));
    }
  };
  
  connection.onerror = (err) => {
    console.log('An error ocurred', err);
  }; 
  
  connection.onmessage = (msg) => {
    var obj = JSON.parse(msg.data);

    switch (obj.type) {
      case 'LoginOK':
        console.log('LoginStatus: ✅', obj );
        $('.world').load('../worldPage/world.html');

        // Ask for positions, the timeout is because i couldnt pass the variable positions
        // and when i was reading the variable positions in world.js i was getting undefined
        // so now when i receive the response, its in world, not in login
        setTimeout(() => connection.send(JSON.stringify({type: 'getPositions'})), 1000);
        break;

      // TODO
      case 'LoginWRONG':
        alert('Wrong password: ❌' );

      default:
        break;
    }
  };
}

function isValidString(str, invalidCharacters = ['<', '>', '+', ',', '.', "'", '_', '-', '&', '=']) {
  var arr = invalidCharacters;
  for (var i = arr.length - 1; i >= 0; --i) {
    if (str.indexOf(arr[i]) != -1) {
      alert(`The character ${arr[i]} is not allowed`); 
      return false;
    }
  }
  return str !== '';
}