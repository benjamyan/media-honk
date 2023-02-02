/** Global definitions to be used throughout the api, regardless of location/routes/whatever */
import * as Express from 'express';

export {}

export namespace Serve {
    export interface Configuration {
        dns: string;
        server: string;
        domain: string;
        dev_http_port: number;
        dev_https_port: number;
        use_https: boolean;
        allowedOrigins: string[];
        userMediaPaths: Record<string | number, string>;
        users: string[];
        admins: string[];
        mysql: Record<string, any>;
    }
    /** Redeclaring express namespaces */
    export interface Request extends Express.Request {
        query: {
            metatype?: 'artists' | 'categories';
            file?: string;
        }
    }
    export interface Response extends Express.Response {
        locals: Configuration;
    }
    /** The minimal data that needs to returned from a route */
    export interface CommonResponse extends Partial<Express.Response> {
        statusCode: number;
        body?: Record<string, any>;
    }
    export interface ErrorResponse extends Omit<CommonResponse, 'body'> {
        message: string;
    }
    export interface NextFunction extends Express.NextFunction {}
    // export interface Application extends Express.Application {
    //     request: Request;
    //     response: Response;
    // }
}
