const express = require('express');
const router = express.Router();

const MeidaController = require('../controllers/MediaController');

// helper
const checkAuth = require('../helpers/auth').checkAuth;

// Rotas
router.get('/media', checkAuth, MeidaController.showMedias);

module.exports = router;

