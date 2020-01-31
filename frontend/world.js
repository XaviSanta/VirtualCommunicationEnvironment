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
  // TODO: If its an okay --> Load world with your user
  if(obj.type === 'OK') {
    $('.container').load('world.html');
  }
  //  TODO: If its a user message: Append message in chatContainer
  //  TODO: If its a user move: move that character to the specified location
};

$('#input').keydown((e) => {
  if(e.key === 'Enter') {
    var msg = $('#input').val();
    connection.send(msg);
  }
});