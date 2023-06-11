/// <reference path='../server.d.ts' />

import { MediaRoutes } from './routes';
import { MediaHonkServerBase } from './_Base';
import { $AggregateService } from './services/AggregateService';
import { HonkRoutes } from './routes/HonkRoute';
import { RouteMiddleware } from './routes/_RouteMiddleware';
import { StreamRoutes } from './routes/StreamRoute';
import { ResourceRoutes } from './routes/ResourceRoute';

export class MediaHonkServer extends MediaHonkServerBase {
    
    constructor() {
        super();
        
        this.on('server.start', async ()=> {
            this.logger('EV server.start');
            if (this.settings.AGGREGATION_TYPE !== undefined) {
                await $AggregateService.handleAggregateRoutine(this.settings.AGGREGATION_TYPE)
            }
            this.initializeExpressServer();
        });
        this.on('server.listening', ()=> {
            this.logger('EV server.listening');
            this.setupServerRouting();
        });
        this.emit('init');
    }
    
    private initializeExpressServer() {
        this.logger('MediaHonkServer.initializeExpressServer()');
        try {
            const establishServer = (port: number)=> {
                this.logger(' > Attempting connection on port: ' + port);
                this.app
                    .listen(port, ()=> {
                        this.logger(` < Listening on ${listeningNamespace}:${port}\n`);
                        this.emit('server.listening');
                    })
                    .on('error', (err)=> {
                        if (err.message.indexOf('EADDRINUSE') > -1) {
                            this.logger(` < ${err.message}`);
                        }
                        establishServer(port + 1)
                    })
            }
            const connectionPort: string = (
                !!this.config.api.use_https
                    ? String(this.config.api.dev_https_port)
                    : String(this.config.api.dev_http_port)
            );
            let listeningNamespace: string = null!;
            
            if (process.env.HONK_ENV === 'dev' || process.env.HONK_ENV === 'stage') {
                listeningNamespace = `${this.config.api.use_https ? 'https' : 'http'}://192.168.0.11`
            } else {
                this.emit('error', {
                    error: `Unregonized ENV: ${process.env.HONK_ENV}`,
                    severity: 1
                })
            }

            establishServer(parseInt(connectionPort));
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unhandled error: JobPostServer.initializeExpressServer()'),
                severity: 1
            });
        }
    }
    
    /**
     * @method setupServerMiddleware 
     * Called after the server is started, sets up the middleware/routing we need
     */
    private setupServerRouting() {
        this.logger('MediaHonkServer.setupServerRouting()');
        try {
            new RouteMiddleware();
            new HonkRoutes();
            new MediaRoutes();
            new ResourceRoutes();
            new StreamRoutes();
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unhandled exception'),
                severity: 1
            })
        }
    }
}

