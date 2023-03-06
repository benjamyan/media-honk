/// <reference path='../server.d.ts' />

import { json } from 'express';

import { MediaRoutes } from './routes';
import { MediaHonkServerBase } from './_Base';
import { AggregateService, MediaEntriesProxy } from './services';
import { FileSystemService } from './services/common/FileSystemService';

let AggregateServiceIntermediary: AggregateService = null!;

export class MediaHonkServer extends MediaHonkServerBase {
    
    constructor() {
        super();
        
        // this.enableLogging = true;
        this.on('server.start', async ()=> {
            
            if (process.env.AGGREGATE !== undefined) {
                await this.Aggregate.handleAggregateRoutine(process.env.AGGREGATE)
            }
            this.initializeExpressServer();
            
        });
        this.on('server.listening', ()=> {
            try {
                // this.db.all('SELECT * FROM jobs', (error, rows)=> {
                //     if (error !== null) {
                //         this.emit('error', {
                //             error,
                //             severity: 1
                //         })
                //         return;
                //     }
                //     Object.assign( this.mediaEntries, MediaEntriesProxy(rows) );
                // });
                
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
        this.logger('JobPostServer.initializeExpressServer()');
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
            }

            this.app.listen(connectionPort, ()=> {
                console.log(`Listening on ${listeningNamespace}`);
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
     * @method setupServerMiddleware is called after the server is started, a sets up the middleware/routing we need
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

