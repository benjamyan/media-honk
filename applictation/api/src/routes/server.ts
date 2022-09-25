import express from "express";
import cors from 'cors';

import * as serverController from '../controllers/server';

export const serverCors = (localConfig: Record<string, any>): cors.CorsOptions => ({
    origin: localConfig.allowedOrigins as string[],
    methods: [ 'GET', 'OPTIONS', 'HEAD' ],
    // allowedHeaders: [
    //     'Accept, */*',
    //     'Content-Type, image/jpeg',
    //     'Content-Type, video/mp4',
    //     'Content-Type, text/html; charset=UTF-8'
    // ],
    preflightContinue: true,
    optionsSuccessStatus: 200
})

export const serverRoutes = ()=> {
    const router = express.Router();
    // router.options('/', serverController.corsDelegate)
    router.get('/', serverController.healthStatus);
    router.get('/library', serverController.getLibrary);
    router.get('/image', serverController.getImage);
    router.get('/video', serverController.getVideoFilePipe);
    return router
}

// export default serverRoutes