const CONFIG = require('../../../hidden_configs');

module.exports = function serverPoke(context) {
    const { 
        headers: {
            origin
        }
    } = context;
    if (context.method !== 'GET' || origin === undefined || !CONFIG.allowedOrigins.includes(origin)) {
        // Logger.error('Unhandled connection from: ' + origin);
        context.res.sendStatus(401)
    } else {
        // Logger.log('Connection from ' + origin)
        context.res.sendStatus(200)
    }
}
// module.exports = serverPoke