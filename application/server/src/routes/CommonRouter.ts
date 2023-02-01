import { Serve } from "../types";

export interface CommonRouteErrorResponseParams {
    res: Serve.Response;
    err: Error;
    code?: number;
}

export class CommonRoute {
    
    public errorConstructor(err: unknown | any, code?: number) {
        let statusCode = code;
        if (statusCode === undefined) {
            if (err instanceof Error) {
                statusCode = 500;
            } else {
                statusCode = 400;
            }
        }
        return {
            err: (
                err instanceof Error 
                    ? err 
                    : new Error('Unhandled exception')
            ),
            code: statusCode
        }
    }

    /**
     * 
     */
    public errorResponse({res, err, code}: CommonRouteErrorResponseParams) {

        if (err instanceof Error && err.message.length > 0) {
            res
                .status(code || 400)
                .send(JSON.stringify(err.message));
        } else {
            res
                .status(500)
                .send("Unhandled exception");
        }
    }
}