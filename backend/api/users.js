const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

const DBpath = path.join(__dirname, '../DB', 'users.json');

// GET
// api/users
//router.get('/', (req,res) => res.json(users)); 
router.get('/', (_,res) => {
  // fs.readFile(path.join(__dirname, '../DB', ))
  fs.readFile(DBpath, (err, content) => {
    if(err) throw err;
    let users = JSON.parse(content);
    res.json(users);
    console.log(users)
  });
});

// POST
// Create User
router.post('/', (req, res) => {
  const newUser = {
    id: uuid.v4(),
    name: req.body.name,
    pass: req.body.pass
  }

  if (!newUser.name || !newUser.pass) {
    return res.status(400).json({msg: 'Please include name and pass'});
  }


  fs.readFile(DBpath, (err, content) => {
    if(err) throw err;
    let users = JSON.parse(content);
    users.push(newUser);
    fs.writeFileSync(DBpath, JSON.stringify(users));
    return res.json(users);
  });
});

// DELETE USER 

module.exports = router;