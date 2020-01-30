const router = require('express').Router();
const WebSocket = require('ws');

const broadcast = (clients, message) => {
  clients.forEach((client) => {
    if (client.readyState == WebSocket.OPEN) {
      client.send(message);
    }
  });
};

router.get('/a', (req, res) => {
  broadcast(req.app.locals.clients, 'BARK');
  return res.sendStatus(200);
})

module.exports = router;