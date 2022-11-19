// import { Express } from 'express';
import Cors from 'cors'
// https://expressjs.com/en/resources/middleware/cors.html#configuring-cors

// const allowlist = ['http://example1.com', 'http://example2.com']
// var corsOptionsDelegate = function (req, callback) {
//   var corsOptions;
//   if (allowlist.indexOf(req.header('Origin')) !== -1) {
//     corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false } // disable CORS for this request
//   }
//   callback(null, corsOptions) // callback expects two parameters: error and options
// }

// const baselineCorsOptions = (localConfig: Record<string, any>): Cors.CorsOptions => ({
//     // origin: localConfig.allowedOrigins as string[],
//     methods: [ 'OPTIONS', 'GET', 'PUT', 'HEAD' ],
//     // allowedHeaders: [
//     //     'Content-Type, text/html; charset=UTF-8'
//     // ],
//     // preflightContinue: false,
//     optionsSuccessStatus: 200
// });

export function corsDelegate(locals: any, req: Cors.CorsRequest, callback: any) {
    console.log(1)
    const corsOptions: Cors.CorsOptions = {
        methods: [ 'OPTIONS', 'GET', 'PUT', 'HEAD' ],
        optionsSuccessStatus: 200
    };
    // if (allowlist.indexOf(req.header('Origin')) !== -1) {
    //   corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    // } else {
    //   corsOptions = { origin: false } // disable CORS for this request
    // }
    callback(null, corsOptions)
}
