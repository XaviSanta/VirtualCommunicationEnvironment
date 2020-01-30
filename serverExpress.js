const express = require('express');
const path = require('path');
const logger = require('./logger');

// Init express
const app = express();

// Init logger
app.use(logger);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false})); 

// Set static folder
app.use(express.static(path.join(__dirname, 'www')));

app.use('/api/users', require('./api/users'));

// Listen on a port 
const PORT = 9034;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));