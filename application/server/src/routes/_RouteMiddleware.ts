import { default as Express, json } from 'express';
import { RouteBase } from './_RouteBase';
import { MediaHonkServerBase } from '../_Base';

export class RouteMiddleware extends MediaHonkServerBase {
    constructor() {
        super();
        
        this.app.use(json());
        this.app.use('*', [ 
            this.logRouteTraffic, 
            this.setRouteResponseHeaders 
        ]);
    }

    private logRouteTraffic = (req: Express.Request, res: Express.Response, next: Express.NextFunction)=> {
        try {
            this.logger(` > ${req.protocol}: ${req.baseUrl}`);
            next();
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 3,
                response: res
            })
        }
    }

    private setRouteResponseHeaders = (req: Express.Request, res: Express.Response, next: Express.NextFunction)=> {
        res.header('Access-Control-Allow-Origin', 'http://192.168.0.11:8080');
        next();
    }
}