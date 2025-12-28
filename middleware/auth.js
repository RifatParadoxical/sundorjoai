const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    

    

    req.session.returnTo = req.originalUrl;
    res.redirect('/signin');
};





const redirectIfAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/chat');
    }
    next();
};

module.exports = {
    requireAuth,
    redirectIfAuthenticated
};

