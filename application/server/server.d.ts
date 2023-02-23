/// <reference path='../global.d.ts' />

import { default as Express } from "express";
import { PathLike } from "fs";

declare global {
    declare namespace NodeJS {
        interface ProcessEnv {
            HONK_ENV: 'dev' | 'stage' | 'prod';
            BASE_DIRECTORY: string;
            CONFIG_FILE_PATH: string;
            // API_TOKEN: string;
        }
    }
    namespace HonkServer {
        /** The local configuration passed in from `config.yaml` */
        // export interface Configuration {
        //     dns: string
        //     namespace: string;
        //     domain: string;
        //     directory: string;
        //     serve: {
        //         dev_http_port: number;
        //         dev_https_port: number;
        //         use_https: boolean;
        //         permitted_origins: Array<string>;
        //         users: Array<string>;
        //         admins: Array<string>;
        //         media_paths: Record<string, string>;
        //     };
        //     db: {
        //         file: string;
        //     };
        // }
        /** Customized events and emitters */
        export type InternalEvents = {
            [key: string]: (...args0: any) => void;
            error: (args0: {
                error: Error | unknown;
                /** severity rating 
                 * - `1` _severe_ will exit the program
                 * - `2` _warning_ most likely a server error
                 * - `3` acts as internal/small
                 */
                severity: number;
                /** optionally provided response; if defined, will send a response as statusCode(500) */
                response?: Express.Response;
            }) => void;
        }
    }
}
