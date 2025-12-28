console.log('index.js has been reloaded');
const chalk = require('chalk').default || require('chalk');
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('./config/database');





const setupSecurity = require('./middleware/security');
const setupSession = require('./middleware/session');
const requestLogger = require('./middleware/logging');



const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');



connectDB().catch(err => {
    console.error('Failed to initialize database connection:', err);
});

// Setup Security Middleware (Helmet, CSP, CORS, Rate Limit)
setupSecurity(app);

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup Session (and user locals)
setupSession(app);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Request logging
app.use(requestLogger);

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes); // /chat and /chat/:id
// Note: chatRoutes also handles /api/chat/:id inside it if we mounted it at /chat? 
// Wait, my chatRoutes logic handles `/` and `/:chatId`.
// But it also defines `/api/:chatId/messages` and `/api/:chatId`.
// If I mount it at `/chat`, then `/chat/api/...` works?
// No, the original API was `/api/chat/:chatId`.
// So I should probably mount the API routes separately or handle the prefixes correctly in `routes/chat.js`.

// Let's re-examine routes/chat.js
/*
router.get('/', ...) -> /chat/
router.get('/:chatId', ...) -> /chat/:chatId
router.get('/api/:chatId/messages', ...) -> /chat/api/:chatId/messages (This is wrong if I want /api/chat/...)
router.post('/api/:chatId', ...) -> /chat/api/:chatId
*/

// The original `index.js` had:
// app.get('/chat', ...)
// app.get('/chat/:chatId', ...)
// app.get('/api/chat/:chatId/messages', ...)
// app.post('/api/chat/:chatId', ...)

// If I mount `chatRoutes` at `/chat`, then:
// `router.get('/', ...)` becomes `/chat/` (Correct)
// `router.get('/:chatId', ...)` becomes `/chat/:chatId` (Correct)
// `router.get('/api/:chatId/messages', ...)` becomes `/chat/api/:chatId/messages` (WRONG, needs to be /api/chat/...)

// So I should probably define two routers or handle it differently.
// OR, I mount it at `/` and prefix in the route definitions.
// Let's mount `chatRoutes` at `/`.
app.use('/', chatRoutes);
// In chatRoutes:
// `router.get('/chat', ...)`
// `router.get('/chat/:chatId', ...)`
// `router.get('/api/chat/:chatId/messages', ...)`
// `router.post('/api/chat/:chatId', ...)`

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { user: res.locals.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
