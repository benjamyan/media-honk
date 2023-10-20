/// <reference path='../global.d.ts' />

import { FastifyInstance } from "fastify";
import { FastifyReply } from "fastify/types/reply";
import { PathLike } from "fs";

declare global {
    declare namespace NodeJS {
        interface ProcessEnv extends HonkServer.ProcessEnv {}
    }
    // declare namespace fastify {
    //     // export interface FastifyInstance<
    //     //   HttpServer = http.Server,
    //     //   HttpRequest = http.IncomingMessage,
    //     //   HttpResponse = http.ServerResponse
    //     // > {
    //     //   streamMedia: ()=> void;
    //     // }
    //     export interface FastifyAugment extends FastifyReply {
    //         streamMedia: ()=> void;
    //     }
    // }
    namespace HonkServer {

        export type ApplicationConfig = {
            dns: string;
            namespace: string;
            domain: string;
            directory: PathLike;
            api: {
                dev_http_port: number;
                dev_https_port: number;
                use_https: boolean;
                permitted_origins: string[];
                users: string[];
                admins: string[];
                media_paths: Record<string, string>;
            };
            db: {
                file: string;
            };
        }

        /** CLI arguments the server can accept */
        export type ProcessEnv = {
            /** Which env to run faker on */
            FAKER_ENV: "db" | "server";
            /** Types of data to fake */
            FAKE_TYPES: "audio" | "video" | 'image' | 'all';
            /** Node env substitute
             * `dev` -
             * `stage` -
             * `prod` -
             */
            HONK_ENV: 'dev' | 'stage' | 'prod';
            /** The location on your file system that the application is running from */
            BASE_DIRECTORY: string;
            /** Your `config.yaml` file path relative to the `BASE_DIRECTORY` above */
            CONFIG_FILE_PATH: string;
            /** Whether to run the aggregation service and populate the database 
             * `update` will add new extries and update existing ones
             * @todo`remake` will restart the database from scratch
             * @todo `add` will only add new entries not found in the database
             */
            AGGREGATION_TYPE: 'remake' | 'update' | 'add';
            /** Whether to aggregate against directories with media types that do not have a definition file. A found directory is treated as such:
             * `title` = the directories name
             * `media_type` = The majority of media extensions in the directory
             */
            LOOSE_AGGREGATE: 'true' | 'false';
            /** Use the deprecated version of .yaml configs associated with media entries
             * 
             */
            DEPRECATED_DEFS: 'true' | 'false';
        }

        /** The CLI arguments parsed to a friendlier format */
        export type EnvSettings = {
            [Key in keyof ProcessEnv]: (
                ProcessEnv[Key] extends ('true' | 'false')
                    ? boolean
                    : ProcessEnv[Key]
            )
        }
        
    }
}
