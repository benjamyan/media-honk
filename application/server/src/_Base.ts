import { default as Express } from 'express';
import { default as dotenv } from 'dotenv';
import { default as Path } from 'path';
import { default as Fs } from 'fs';

import { default as Yaml } from 'yaml';
// https://www.npmjs.com/package/tiny-typed-emitter
import { TypedEmitter } from 'tiny-typed-emitter';
// https://github.com/TryGhost/node-sqlite3/wiki/API
// import { default as SQLite } from 'sqlite3';
import { default as Knex } from 'knex';
import { default as Objection, Model } from 'objection';
import { BundlesModel, CoversModel, MediaModel, MetaModel, SourcesModel } from './models';
import { MediaMetaModel } from './models/MediaMetaModel';
import { BundleMediaModel } from './models/BundleMediaModel';

dotenv.config({ path: Path.resolve(__dirname, '../.env') });

const logger = (msg: string, tracing?: boolean)=> {
    if (!!tracing) {
        console.trace(msg);
    } else {
        console.log(msg);
    }
}

let app = Express(),
    knexInstance: ReturnType<typeof Knex> = null!,
    databaseConnection: {
        Bundles: typeof BundlesModel,
        Media: typeof MediaModel,
        Meta: typeof MetaModel,
        Covers: typeof CoversModel,
        Sources: typeof SourcesModel
    } = {
        Bundles: BundlesModel,
        Media: MediaModel,
        Meta: MetaModel,
        Covers: CoversModel,
        Sources: SourcesModel
    },
    localConfig: Honk.Configuration = null!,
    mediaEntries: Record<string, Honk.Media.BaselineMediaProperties> = {};
    
export class MediaHonkServerBase extends TypedEmitter<HonkServer.InternalEvents> {
    public enableLogging: boolean = true;
    public mediaEntries: Record<string, Honk.Media.BaselineMediaProperties> = mediaEntries;
    
    static config: Honk.Configuration = null!;
    static emitter: TypedEmitter<HonkServer.InternalEvents>['emit'] = null!;
    static logger: any = null!;
    
    constructor() {
        super();
        
        this.on('init', async ()=> {
            this.logger(`Init HonkServer in env: ${process.env.HONK_ENV}`)

            await this.mountEnvironmentalConfig();
            await this.establishDatabaseConnection();
            
            this.emit('server.start');
        });
        this.on('error', (errorArgs)=>{
            if (errorArgs instanceof Error) {
                console.warn(errorArgs.message)
            } else if (typeof(errorArgs) === 'string') {
                console.warn(errorArgs)
            } else if (typeof(errorArgs) === 'object') {
                const { error, severity, response } = errorArgs;
                if (error instanceof Error || typeof(error) === 'string') {
                    console.warn(error)
                } else {
                    console.error('Unhandled exception')
                    console.trace();
                }
                
                if (response !== undefined) {
                    response.sendStatus(500);
                }
                if (severity === 1) {
                    // this.db.destroy();
                    process.exit(2);
                }
            }
        });
    }
    
    static {
        this.emitter = super.prototype.emit;
        this.config =  localConfig;
        this.logger = logger;
    }
    
    get config() {
        // console.log(localConfig)
        if (localConfig === null) {
            this.logger('MOUNT localConfig');
            this.mountEnvironmentalConfig();
        }
        return localConfig;
    }
    get db() {
        if (databaseConnection === null) {
            this.logger('MOUNT localConfig');
            this.establishDatabaseConnection();
        }
        return databaseConnection
    }
    get app() {
        if (app === null) {
            this.logger('MOUNT app');
            app = Express();
        }
        return app;
    }
    get logger() {
        return logger;
    }

    // public logger(msg: string, tracing?: boolean) {
    //     if (!this.enableLogging) {
    //         return;
    //     } else if (!!tracing) {
    //         console.trace(msg);
    //     } else {
    //         console.log(msg);
    //     }
    // }

    private async establishDatabaseConnection() {
        this.logger('MediaHonkServerBase.establishDatabaseConnection()');
        try {
            knexInstance = Knex({
                client: 'sqlite3',
                useNullAsDefault: true,
                connection: {
                    filename: this.config.db.file
                },
                acquireConnectionTimeout: 5000,
            })
            Objection.Model.knex(knexInstance);
            
            await Objection.Model
                .knex().schema
                .hasTable('media')
                .then(async (tablePresent)=>{
                    if (!tablePresent) {
                        await SourcesModel.mountSourcesTable();
                        await BundlesModel.mountBundlesTable();
                        await CoversModel.mountCoversTable();
                        await MetaModel.mountMetaTable();
                        await MediaModel.mountMediaTable();
                        await MediaMetaModel.mountMediaMetaTable();
                        await BundleMediaModel.mountBundleMediaTable();
                    }
                })
                .catch(err=>{
                    console.error(err)
                    this.emit('error', {
                        error: err instanceof Error ? err : new Error('Unhandled exception. MediaHonkServerBase.establishDatabaseConnection()'),
                        severity: 1
                    })
                });

        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unable to establish database connection'),
                severity: 1
            })
        }
    }

    /** Mount and check the environmental variables for errors */
    private async mountEnvironmentalConfig() {
        this.logger('MediaHonkServerBase.mountEnvironmentalConfig()');
        try {
            if (localConfig !== null) {
                return;
            } else if (Fs.existsSync(Path.join(process.env.BASE_DIRECTORY, process.env.CONFIG_FILE_PATH))) {
                localConfig = (
                    Yaml.parse(Fs.readFileSync(Path.join(process.env.BASE_DIRECTORY, process.env.CONFIG_FILE_PATH), 'utf-8'))
                );
                return;
                // this.config = localConfig;
            } else throw new Error('Failed to locate required configurations');
        } catch (err) {
            this.emit('error', {
                error: (
                    err instanceof Error 
                        ? err 
                        : new Error(`Unhandled exception: MediaHonkServerBase.mountEnvironmentalConfig`)
                ),
                severity: 1
            })
            return;
        }
    }
    
}
