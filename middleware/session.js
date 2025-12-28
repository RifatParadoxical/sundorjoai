const session = require('express-session');
const MongoStore = require('connect-mongo');

const setupSession = (app) => {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/sundorjo',
            ttl: 14 * 24 * 60 * 60 
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true, 
            maxAge: 14 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        }
    }));

    
    app.use((req, res, next) => {
        res.locals.user = req.session.userId ? { email: req.session.userEmail, id: req.session.userId } : null;
        next();
    });
};

module.exports = setupSession;
