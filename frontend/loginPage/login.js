var connection;
var username;
var positions = {};

function login() {
  username = $('#username').val();
  var password = $('#password').val();

  connection = new WebSocket('ws://ecv-etic.upf.edu/node/9034/ws/');
  
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
      // case 'positions':
      //   positions = obj.data;
      //   console.log('Positions in login: ', positions);
      //   break;

      // TODO
      case 'LoginOK':
        console.log('LoginStatus: ✅', obj );
        $('.world').load('../worldPage/world.html');

        // Ask for positions, the timeout is because i could pass the variable positions
        // and when i was reading the variable positions in world.js i was getting undefined
        // so now when i receive the response, its in world, not in login
        setTimeout(() => connection.send(JSON.stringify({type: 'getPositions'})), 250);
        break;

      // TODO
      case 'LoginWRONG':
        alert('Wrong password: ❌' );

      default:
        break;
    }
  };
}

function isValidString(str) {
  var arr = ['<', '>', '+', ',', '.', "'", '_', '-', '&', '='];
  for (var i = arr.length - 1; i >= 0; --i) {
    if (str.indexOf(arr[i]) != -1) {
      alert(`The character ${arr[i]} is not allowed`); 
      return false;
    }
  }
  return str !== '';
}