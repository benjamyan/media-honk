/// <reference path='../server.d.ts' />

import { json } from 'express';

import { MediaRoutes } from './routes';
import { MediaHonkServerBase } from './_Base';
import { AggregateService } from './services';

let AggregateServiceIntermediary: AggregateService = null!;

export class MediaHonkServer extends MediaHonkServerBase {
    
    constructor() {
        super();
        
        // this.enableLogging = true;
        this.on('server.start', async ()=> {
            this.logger('EV server.start');
            console.log({...this.settings})
            if (this.settings.AGGREGATION_TYPE !== undefined) {
                await this.Aggregate.handleAggregateRoutine(this.settings.AGGREGATION_TYPE)
            }
            this.initializeExpressServer();
        });
        this.on('server.listening', ()=> {
            this.logger('EV server.listening');
            try {
                this.setupServerMiddleware();
            } catch (err) {
                this.emit('error', {
                    error: err instanceof Error ? err : new Error('Unhandled exception'),
                    severity: 1
                })
            }
        });
        this.emit('init');
    }

    get Aggregate() {
        if (AggregateServiceIntermediary === null) {
            AggregateServiceIntermediary = new AggregateService();
        }
        return AggregateServiceIntermediary;
    }

    private initializeExpressServer() {
        this.logger('MediaHonkServer.initializeExpressServer()');
        try {
            let connectionPort: string = null!,
                listeningNamespace: string = null!;

            if (!!this.config.api.use_https) {
                connectionPort = String(this.config.api.dev_https_port);
            } else {
                connectionPort = String(this.config.api.dev_http_port);
            }

            if (process.env.HONK_ENV === 'dev' || process.env.HONK_ENV === 'stage') {
                listeningNamespace = `${this.config.api.use_https ? 'https' : 'http'}://localhost:${connectionPort}`
            } else {
                //
            }

            this.app.listen(connectionPort, ()=> {
                console.log(`- Listening on ${listeningNamespace}\n`);
                this.emit('server.listening');
            })
            // this.app.listen((
            //     process.env.API_DOMAIN !== undefined && process.env.API_DOMAIN.length > 0
            //         ? `${process.env.API_DOMAIN}:${process.env.API_PORT}`
            //         : process.env.API_PORT
            // ), ()=> {
            //     console.log(`Listening on ${process.env.API_PORT}`);
            //     this.emit('server.listening');
            // })
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unhandled error: JobPostServer.initializeExpressServer()'),
                severity: 1
            })
        }
    }
    
    /**
     * @method setupServerMiddleware 
     * Called after the server is started, sets up the middleware/routing we need
     */
    private setupServerMiddleware() {
        this.app.use(json());

        this.app.use(function(_req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        
        new MediaRoutes();
        
    }

}

