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
import { default as Objection } from 'objection';

dotenv.config({ path: Path.resolve(__dirname, '../.env') });
const app = Express();
// app.locals = {
//     BASE_DIRECTORY: null!,
//     CONFIG_FILE_PATH: null!,
//     // DB_FILE_PATH: null!,
//     // JOB_INFO_FILE: null!,
//     // SNIPPET_FILE: null!,
//     // API_DOMAIN: null!,
//     // API_PORT: null!,
//     API_TOKEN: null!
// };
// app.locals = null!;
// const SQLiteVerbose = SQLite.verbose();
let databaseConnection: ReturnType<typeof Knex> = null!,
    localConfig: Honk.Configuration = null!;

const mediaEntries: Record<string, Honk.Media.BaselineMediaProperties> = {};

export class MediaHonkServerBase extends TypedEmitter<HonkServer.InternalEvents> {
    private enableLogging: boolean = false;
    public config: Honk.Configuration = null!;
    public app: Express.Application = app; 
    public db: typeof databaseConnection = null!;
    public mediaEntries: Record<string, Honk.Media.BaselineMediaProperties> = mediaEntries;
    
    static config: Honk.Configuration = null!;
    static emitter: TypedEmitter<HonkServer.InternalEvents>['emit'] = null!;
    
    constructor() {
        super();

        this.on('init', ()=> {
            this.logger(`Init HonkServer in env: ${process.env.HONK_ENV}`)

            this.mountEnvironmentalConfig();
            this.establishDatabaseConnection();
            
            this.emit('server.start');
        });
        this.on('error', ({ error, severity, response })=>{
            if (error instanceof Error || typeof(error) === 'string') {
                console.warn(error)
            } else {
                console.error('Unhandled exception')
                console.trace();
            }
            
            if (response !== undefined) {
                response.sendStatus(500);
            }
            if (severity === undefined || severity === 1) {
                this.db.destroy();
                process.exit(2);
            }
        });
    }
    
    static {
        this.emitter = super.prototype.emit;
    }
    
    public logger(msg: string, tracing?: boolean) {
        if (!this.enableLogging) {
            return;
        } else if (!!tracing) {
            console.trace(msg);
        } else {
            console.log(msg);
        }
    }

    private establishDatabaseConnection() {
        try {
            databaseConnection = Knex({
                client: 'sqlite3',
                useNullAsDefault: true,
                connection: {
                    filename: this.config.db.file
                }
            });
            Objection.Model.knex(databaseConnection)
            this.db = databaseConnection;
            
            /** Test the table present; if `sources` is not present, the tables need to be mounted */
            if (!this.db.schema.hasTable('sources')) {
                console.log('TODO no schema available')
            } 
            // else {
            //     this.db
            //         .select('*')
            //         .from('sources')
            //         .then((result)=>console.log(result))
            //         .catch((err)=>console.log(err))
            // }
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error('Unable to establish database connection'),
                severity: 1
            })
        }
    }

    /** Mount and check the environmental variables for errors */
    private mountEnvironmentalConfig() {
        this.logger('MediaHonkServerBase.mountEnvironmentalConfig()');
        try {
            if (Fs.existsSync(Path.join(process.env.BASE_DIRECTORY, process.env.CONFIG_FILE_PATH))) {
                localConfig = (
                    Yaml.parse(Fs.readFileSync(Path.join(process.env.BASE_DIRECTORY, process.env.CONFIG_FILE_PATH), 'utf-8'))
                );
                this.config = localConfig;
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
