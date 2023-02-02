import { Serve } from "../../types";
import { UtilityService } from ".";

export class FactoryService implements UtilityService {

    constructor() {
        // super()
    }

    static buildCommonResponseEntity(body: Serve.CommonResponse['body']): Serve.CommonResponse {
        let commonResponse: Serve.CommonResponse = {
            statusCode: -1
        } 

        if (Array.isArray(body)) {
            //
        }

        return commonResponse
    }
    static buildErrorResponseEntity(err: unknown | any, code?: number): Serve.ErrorResponse {
        let statusCode = code;
        if (statusCode === undefined) {
            if (err instanceof Error) {
                statusCode = 500;
            } else {
                statusCode = 400;
            }
        }
        return {
            message: (
                err instanceof Error 
                    ? err.message
                    : 'Unhandled exception'
            ),
            statusCode: statusCode
        }
    }
}
