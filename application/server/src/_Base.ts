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
import { cmdLogger } from './helpers'
import { ConfiguredMediaProperties } from './types/MediaProperties';

dotenv.config({ path: Path.resolve(__dirname, '../.env') });

const logger = cmdLogger;
let app = Express(),
    knexInstance: ReturnType<typeof Knex> = null!,
    localSettings: HonkServer.EnvSettings = null!,
    localConfig: HonkServer.ApplicationConfig = null!,
    mediaEntries: Record<string, ConfiguredMediaProperties> = {};
    
export class MediaHonkServerBase extends TypedEmitter<HonkServer.InternalEvents> {
    public enableLogging: boolean = true;
    public mediaEntries: Record<string, ConfiguredMediaProperties> = mediaEntries;
    
    static settings: typeof localSettings = null!;
    static config: typeof localConfig = null!;
    static emitter: TypedEmitter<HonkServer.InternalEvents>['emit'] = null!;
    static logger: any = null!;
    static on: any = null!;
    
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
        this.on = super.prototype.on;
        this.config =  localConfig;
        this.settings = localSettings;
        this.logger = logger;
    }
    
    get settings() {
        if (localSettings === null) {
            this.logger('! MOUNT process env settings');
            this.mountProcessEnvSettings();
        }
        return localSettings
    }
    get config() {
        if (localConfig === null) {
            this.logger('! MOUNT local config');
            this.mountEnvironmentalConfig();
        }
        return localConfig;
    }
    get app() {
        if (app === null) {
            this.logger('! MOUNT app');
            app = Express();
        }
        return app;
    }
    get logger() {
        return logger;
    }
    
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
            this.logger('- Connected to DB');
            
            await Objection.Model
                .knex().schema
                .hasTable(MediaModel.tableName)
                .then(async (tablePresent)=>{
                    if (!tablePresent) {
                        this.logger('- Creating database tables');
                        await SourcesModel.mountSourcesTable();
                        await BundlesModel.mountBundlesTable();
                        await CoversModel.mountCoversTable();
                        await MetaModel.mountMetaTable();
                        await MediaModel.mountMediaTable();
                        await MediaMetaModel.mountMediaMetaTable();
                        await BundleMediaModel.mountBundleMediaTable();
                    } else {
                        this.logger('- Tables already exist');
                    }
                })
                .then(()=>{
                    this.logger('- DB good to go');
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

    /** Captures CLI variables and adds them to the local settings obj */
    private mountProcessEnvSettings() {
        this.logger('MediaHonkServerBase.mountProcessEnvSettings()');
        const requiredEnv = [ 'HONK_ENV', 'BASE_DIRECTORY', 'CONFIG_FILE_PATH' ];
        const optionalEnv = [ 'AGGREGATION_TYPE', 'ENABLE_LOOSE_AGGREGATION', 'DEPRECATED_DEFS' ];
        localSettings = requiredEnv.concat(optionalEnv).reduce((envAccumulator, keyname)=> {
            let currentEnvValue = process.env[keyname],
                newLocalSetting;
            switch (keyname) {
                case 'LOOSE_AGGREGATE':
                case 'DEPRECATED_DEFS': {
                    currentEnvValue = currentEnvValue as HonkServer.ProcessEnv['DEPRECATED_DEFS'];
                    if (currentEnvValue.toLowerCase() === 'true') {
                        newLocalSetting = true;
                    } else {
                        newLocalSetting = false;
                    }
                    break;
                }
                default: newLocalSetting = currentEnvValue;
            }
            return {
                ...envAccumulator,
                [keyname]: newLocalSetting
            }
        }, {} as HonkServer.EnvSettings);
            
        requiredEnv.forEach((requiredVar)=>{
            if (requiredVar === undefined) {
                this.emit('error', {
                    error: new Error(`Required env variable not set: ${requiredVar}`),
                    severity: 1
                })
            }
        })

        this.logger('- Env settings loaded');
    }

    /** Mount and check the configuation in the local YAML file */
    private async mountEnvironmentalConfig() {
        this.logger('MediaHonkServerBase.mountEnvironmentalConfig()');
        try {
            if (localConfig !== null) return;

            
            if (Fs.existsSync(Path.join(this.settings.BASE_DIRECTORY, this.settings.CONFIG_FILE_PATH))) {
                localConfig = (
                    Yaml.parse(Fs.readFileSync(Path.join(this.settings.BASE_DIRECTORY, this.settings.CONFIG_FILE_PATH), 'utf-8'))
                );
                return;
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
        } finally {
            this.logger('- Env config loaded')
        }
    }
    
}
