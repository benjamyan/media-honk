/// <reference path='../server.d.ts' />

import { json, Router } from 'express';

import { MediaRoutes } from './routes';
import { MediaHonkServerBase } from './_Base';
import { AggregateService, MediaEntriesProxy } from './services';

export class MediaHonkServer extends MediaHonkServerBase {
    
    constructor() {
        super();
        
        // this.enableLogging = true;
        this.on('server.start', ()=> {
            // console.log(process.env.AGGREGATE)
            if (process.env.AGGREGATE !== undefined) {
                this.aggregateDatabase();
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

    private aggregateDatabase() {
        this.logger('MediaHonkServer.aggregateDatabase -> ' + process.env.AGGREGATE)
        try {
            const Aggregate = new AggregateService();
            
            switch (process.env.AGGREGATE) {
                case 'remake': {
                    /** 
                     * Create backup
                     * Drop all tables
                     * Run aggregate
                     */

                    break;
                }
                case 'update': {
                    /** 
                     * Add new entries
                     * Overwrite existing entries 
                     * Delete nonexistent entries
                     */
                    Aggregate.createDatabaseBackup()
                    Aggregate.handleTableEntryAggregate({
                        tableName: 'sources',
                        comparisonKey: 'abs_url',
                        comparisonData: this.config.api.media_paths,
                        factoryCallback: (dataKey)=> ({
                            abs_url: this.config.api.media_paths[dataKey],
                            title: dataKey
                        })
                    })
                    break;
                }
                case 'add': {
                    /**
                     * Adds new entries to database
                     * Dont overwrite or delete existing entries
                     */

                    break;
                }
                default: {

                }
            }
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unable to establish database connection'),
                severity: 1
            })
        }
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

