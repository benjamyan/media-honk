// import CONFIG from  

// import * as Process from 'node:process';
import * as Fs from 'node:fs';
import * as Path from 'node:path';
// import * as Http from 'node:http';
// import * as Https from 'node:https';
import express from 'express';
// import cors from 'cors';
import * as Yaml from 'yaml';
import { default as objection } from 'objection';
import { default as Knex } from 'knex'
import Mysql from 'mysql2/promise';


import * as Routes from './routes'
import { Serve } from './types';
import { logger, authenticationMiddleware } from './middleware';

// import { BaseHonkModel } from './models/_DefaultModel';
import { default as MediaRoute, MediaRoutes } from './routes/MediaRoute';

class App {
    public process: NodeJS.Process;
    public app;
    public locals!: Serve.Configuration;
    private configFilePath: Fs.PathLike = Path.resolve(__dirname, '../../config.yaml');
    
    constructor() {

        this.process = process;
        this.app = express();
        this.mountLocals();
        this.setMiddleware();

        this.initKnexDbConnection();
        this.mountRoutes();
        
        this.process.on('exit', (exitCode)=> {
            console.log(`\n----\nNode server shutting down with status code ${exitCode}\n----\n`)
        })
    }

    private mountLocals(): void {
        try {
            // const configFile = Path.resolve(__dirname, '../config.yaml');
            console.log(this.configFilePath)
            if (Fs.existsSync(this.configFilePath)) {
                const localConfig: Serve.Configuration = (
                    Yaml.parse(Fs.readFileSync(this.configFilePath, 'utf-8'))
                );
                this.locals = { ...localConfig }
                this.app.response.locals = { ...localConfig };
            } else throw new Error('Failed to locate required configurations')
        } catch (err) {
            console.log(err)
            this.process.exit(1)
        }
    }

    private setMiddleware(): void {
        try {
            // const _self = this;
            // this.app.use(cors(function(req, callback) {
            //     const corsOptions: cors.CorsOptions = {
            //         methods: [ 'OPTIONS', 'GET', 'PUT', 'HEAD' ],
            //         optionsSuccessStatus: 200
            //     };
            // console.log()
            //     if (_self.locals.allowedOrigins.includes(req.header('Origin'))) {
            //         corsOptions.origin = true
            //     } else {
            //         corsOptions.origin = false
            //     }
            //     callback(null, corsOptions)
            // }))
            // this.app.use(express.static(Path.join(__dirname, '../static')));
            // this.app.response.locals = this.locals;
    
            this.app.use(express.json());
            this.app.use(express.urlencoded());
    
            // basic logger
            this.app.use('*', logger.bind(this))
    
            // auth middleware for all connections
            // this.app.use('*', authenticationMiddleware.bind(this))
        } catch (err) {
            console.log(err)
            this.process.exit(2)
        }
    }

    private initKnexDbConnection(): void {
        try {
            const thisKnex = Knex({
                client: 'mysql2',
                connection: {
                    // host: `${this.locals.mysql.host}:${this.locals.mysql.port}`,
                    host: this.locals.mysql.host,
                    port: this.locals.mysql.port,
                    user: this.locals.mysql.username,
                    password: this.locals.mysql.password,
                    database: this.locals.mysql.db_name
                }
            });
            objection.Model.knex(thisKnex);
        } catch (err) {
            console.log(err)
            this.process.exit(3);
        }
    }

    private mountRoutes(): void {
        // this.app.use('/auth', Routes.authRoutes());
        this.app.use('/', Routes.staticRoutes());
        this.app.use('/server', Routes.serverRoutes());
        // this.app.use('/media', Routes.mediaRoute);
        this.app.use('/media', new MediaRoutes().router);
        // this.app.use('/media', MediaRoute);
        
    }
}

export default new App().app

