const chalk = require('chalk').default || require('chalk');

const requestLogger = (req, res, next) => {
    console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(` ${req.method}`) + chalk.green(` ${req.url}`), {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
};

module.exports = requestLogger;
