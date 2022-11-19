const express = require('express');
// const serverController = require('../controllers/server');
const streamsRoute = require('../routes/streams');
const serverRoute = require('../routes/server');
const relayRoute = require('../routes/relay');
// const poke = require('../controllers/server/poke')

module.exports = (context) => {
    console.log(context)
    // const { 
    //     headers: {
    //         origin
    //     }
    // } = context;
    // if (origin === undefined || !CONFIG.allowedOrigins.includes(origin)) {
    //     // Logger.error('Unhandled connection from: ' + origin);
    //     router.res.sendStatus(401)
    // } else {
        let router = express.Router();
        // Logger.log('Connection from ' + origin)
        router.use('/streams', streamsRoute.bind(context));
        router.use('/server', serverRoute.bind(context));
        router.use('/relay', relayRoute.bind(context));
    // }
    return router;
};
