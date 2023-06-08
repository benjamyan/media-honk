const logger = (msg: string, tracing?: boolean)=> {
    if (!!tracing) {
        console.trace(msg);
    } else {
        console.log(`LOG: ${msg}`);
    }
}

export default logger;


// import { NextFunction } from 'express';
// import { Serve } from '../types/@node_modules'

// interface LoggerPayload {
//     // Username credential for requested source
//     user: string;
//     // Date/time 
//     date: Date | string;
//     // originating information (ip, host, etc)
//     origin: any;
//     // Intended route
//     route: string;
//     // Request method
//     method: Serve.Request['method'];
//     // Payload if any
//     payload: {
//         query?: any;
//         body?: any;
//         params?: any;
//     };
// }

// export function logger(req: Serve.Request, res: Serve.Response, next: Serve.NextFunction) {
//     try {
//         const loggerValue: LoggerPayload = {
//             user: '',
//             date: new Date().toLocaleString("en-US"),
//             origin: req.ip,
//             route: req.baseUrl,
//             method: req.method,
//             payload: {
//                 query: { ...req.query },
//                 body: { ...req.body },
//                 params: { ...req.params }
//             }
//         }
//         console.log(`${loggerValue.method} for ${loggerValue.route} from ${loggerValue.origin} at ${loggerValue.date}`)
//     } catch (err) {
//         console.log(err)
//     } finally {
//         next();
//     }
// }