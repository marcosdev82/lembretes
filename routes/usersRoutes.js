const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');

router.get('/user', UsersController.showUsers);

module.exports = router;
