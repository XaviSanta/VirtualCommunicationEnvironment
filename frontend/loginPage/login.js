var connection;
var username;

function login() {
  username = $('#username').val();
  var password = $('#password').val();

  if(!isValidString(username) || !isValidString(password)) {
    return false;
  }

  connection = new WebSocket('wss://ecv-etic.upf.edu/node/9034/ws/');
  // connection = new WebSocket('ws://127.0.0.1:9034');
  
  connection.onopen = () => {
    console.log('Connection is open and ready to use');
    if(isValidString(username) && isValidString(password)) {
      connection.send(JSON.stringify({type: 'login', data: {username, password}}));
    }
  };
  
  connection.onerror = (err) => {
    console.log('An error ocurred', err);
    alert('An error ocurred, refresh the page');
  }; 
  
  connection.onmessage = (msg) => {
    var obj = JSON.parse(msg.data);

    switch (obj.type) {
      case 'LoginOK':
        console.log('LoginStatus: Success', obj );
        $('.world').load('../worldPage/world.html');
        break;

      // TODO
      case 'LoginWRONG':
        alert('Wrong password' );

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
