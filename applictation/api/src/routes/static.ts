import express from "express";
// import * as Fs from 'node:fs'
// import * as Path from 'node:path'

import { Honk } from '../types';
import { validateFile } from "../utils";

export const staticRoutes = ()=> {
    const router = express.Router();
    
    router.get(['/', '*'], function(req: Honk.Request, res: Honk.Response, next: Honk.NextFunction) {
        try {
            if (req.originalUrl.split('/').length > 2) {
                next()
            } else {
                const file = validateFile(req.originalUrl === '/' ? 'index.html' : req.originalUrl);
                if (file !== false) {
                    res.statusCode = 200;
                    res.sendFile(file);
                } else {
                    res.statusCode = 404;
                    res.send(`File not found: ${req.originalUrl}`)
                }
            }
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    })

    return router
}

// export default serverRoutes