// / <reference path='../../server.d.ts' />

import { default as Express } from 'express';
import { default as Path } from 'path';
import { default as Fs } from 'fs';

import { RouteBase } from './_RouteBase';

export class HonkRoutes extends RouteBase {
    
    constructor() {
        super({
            permittedQuery: {},
            permittedBody: {},
            requiredHeader: {}
        });
        
        this.app.use('/health', [ this.healthCheck ]);
        
    }

    private healthCheck(_req: Express.Request, res: Express.Response): void {
        try {
            res.sendStatus(200)
        } catch (err) {
            this.emit('error', 'Bad health check')
        }
    }
    

}
