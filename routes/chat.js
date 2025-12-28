const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Helper function to generate unique chat ID
// Note: This logic was moved to controller but route needs to handle it or controller handles the param?
// In my controller refactor, I moved the logic to `redirectChat`.

// Protected chat route - redirect to new chat or load existing
router.get('/chat', requireAuth, chatController.redirectChat);

// Protected chat route with chatId
router.get('/chat/:chatId', requireAuth, chatController.renderChat);

// API route to get chat messages
router.get('/api/chat/:chatId/messages', requireAuth, chatController.getMessages);

// Protected API route for chat
router.post('/api/chat/:chatId', requireAuth, upload.single('image'), chatController.handleChatRequest);

module.exports = router;
