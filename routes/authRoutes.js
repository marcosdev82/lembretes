const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');

// login
router.get('/login', AuthController.login);
router.post('/login', AuthController.loginPost);
router.get('/logout', AuthController.logout);
// register
router.get('/register', AuthController.register);
router.post('/register', AuthController.registerPost);
// users
// router.get('/users', AuthController.showUsers);

module.exports = router;
