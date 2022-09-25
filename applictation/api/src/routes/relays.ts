import express from "express";
// import cors from 'cors';

import * as relayController from '../controllers/relays';

// export const serverCors = (localConfig: Record<string, any>): cors.CorsOptions => ({
//     origin: localConfig.allowedOrigins as string[],
//     methods: [ 'GET', 'OPTIONS', 'HEAD' ],
//     // allowedHeaders: [
//     //     'Accept, */*',
//     //     'Content-Type, image/jpeg',
//     //     'Content-Type, video/mp4',
//     //     'Content-Type, text/html; charset=UTF-8'
//     // ],
//     preflightContinue: true,
//     optionsSuccessStatus: 200
// })

export const relayRoutes = ()=> {
    const router = express.Router();
    router.get('/devices', relayController.getCastingDevices);
    router.post('/cast', relayController.castToDevice);
    // router.options('/', serverController.corsDelegate)
    // router.get('/', function(req, res) {
    //     res.set({
    //         'Access-Control-Allow-Origin': 'http://localhost:8081'
    //     })
    //     res.sendStatus(200)
    // });
    // router.get('/library', serverController.getLibrary);
    // router.get('/image', serverController.getImage);
    // router.get('/video', serverController.getVideoFilePipe);
    return router
}

// export default serverRoutes