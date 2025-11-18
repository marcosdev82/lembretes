const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');

// helper
const checkAuth = require('../helpers/auth').checkAuth;

// login
router.get('/login', AuthController.login);
router.post('/login', AuthController.loginUser);
router.get('/logout', AuthController.logout);
// register
router.get('/register', AuthController.register);
router.post('/register', AuthController.registerUser);
// forgot password
router.get('/forgot-password', AuthController.forgotPassword);

// users
router.get('/users', checkAuth, AuthController.showUsers);

module.exports = router;
