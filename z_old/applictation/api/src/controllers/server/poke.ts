// const CONFIG = require('../../../hidden_configs');
import { Request, Response } from "express";
// export default {}
export default function serverPoke(req: Request, res: Response) {
    const { 
        headers: {
            origin
        }
    } = req;
    if (req.method !== 'GET' || origin === undefined || !res.locals.allowedOrigins.includes(origin)) {
        // Logger.error('Unhandled connection from: ' + origin);
        res.sendStatus(401)
    } else {
        // Logger.log('Connection from ' + origin)
        res.sendStatus(200)
    }
}
// module.exports = serverPoke