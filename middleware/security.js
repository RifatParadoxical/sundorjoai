const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const setupSecurity = (app) => {
    app.use((req, res, next) => {
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https: http: *",
            "connect-src 'self' https: http: ws: wss: *",
            "frame-src 'self'",
            "object-src 'none'"
        ].join('; ');
        res.setHeader('Content-Security-Policy', csp);
        next();
    });




    // Security Middleware - Helmet.js
    app.use(helmet({
        contentSecurityPolicy: false, 
        crossOriginEmbedderPolicy: false
    }));





    // CORS Configuration
    app.use(cors({
        origin: process.env.FRONTEND_URL || '*',
        credentials: true
    }));

    // Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, 
        max: 100, 
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, 
        max: 5,
        message: 'Too many authentication attempts, please try again later.',
        skipSuccessfulRequests: true
    });

    app.use('/api/', limiter);
    app.use('/auth/', authLimiter);
};

module.exports = setupSecurity;
