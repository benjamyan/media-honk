import * as Express from 'express';

export interface FileRequest extends Express.Request {
    query: {
        file?: string;
    }
}
