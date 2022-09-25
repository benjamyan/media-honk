// import CONFIG from  

import * as Process from 'node:process';
import * as Fs from 'node:fs';
import * as Path from 'node:path';
import * as Http from 'node:http'
import express from 'express';
import cors from 'cors';
import * as Yaml from 'yaml';

import * as Routes from './routes'
import { Honk } from './types'
import { authenticateCredentials } from './middleware'

class App {
    public process: NodeJS.Process;
    public app;
    public locals!: Honk.Configuration;

    constructor() {
        this.process = process;
        this.app = express();
        this.mountLocals();
        this.setMiddleware();
        this.mountRoutes();
        
        this.process.on('exit', (exitCode)=> {
            console.log(`\n----\nNode server shutting down with status code ${exitCode}\n----\n`)
        })
    }

    private mountLocals(): void {
        try {
            const configFile = Path.resolve(__dirname, '../config.yaml');
            if (Fs.existsSync(configFile)) {
                const localConfig: Honk.Configuration = (
                    Yaml.parse(Fs.readFileSync(configFile, 'utf-8'))
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

        // auth middleware for all connections
        this.app.use('*', authenticateCredentials.bind(this))
    }

    private mountRoutes(): void {
        this.app.use('/', Routes.staticRoutes())
        this.app.use('/server', Routes.serverRoutes());
        this.app.use('/relay', Routes.relayRoutes());
    }
}

export default new App().app
