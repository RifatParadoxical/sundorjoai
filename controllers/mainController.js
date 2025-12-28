exports.renderIndex = (req, res) => {
    res.render('index', { user: res.locals.user });
};

exports.handleFrontendLogs = (req, res) => {
    const { logs } = req.body;
    if (logs && Array.isArray(logs)) {
        logs.forEach(log => {
            const level = log.level || 'info';
            // Simple console log for now
            console.log(`[FRONTEND] ${log.message}`, log.context || '');
        });
    }
    res.status(204).end();
};
