import { Serve } from "../types";

export interface CommonRouteErrorResponseParams {
    res: Serve.Response;
    err: Error;
    code?: number;
}

export class CommonRoute {

    /** */
    static errorResponse(res: Serve.Response, errorResponseParams: Serve.ErrorResponse) {
        res
            .status(errorResponseParams.statusCode || 500)
            .send(
                errorResponseParams.message.length > 0
                    ? errorResponseParams.message
                    : "Unhandled exception"
            );
    }
}