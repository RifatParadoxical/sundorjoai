const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// Routes
router.get('/', mainController.renderIndex);

// API endpoint for frontend logs
router.post('/api/log', mainController.handleFrontendLogs);

module.exports = router;
