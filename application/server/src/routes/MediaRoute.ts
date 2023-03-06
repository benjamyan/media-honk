// / <reference path='../../server.d.ts' />

import { default as Express } from 'express';
import { default as Path } from 'path';
import { default as Fs } from 'fs';

import { RouteBase } from './_RouteBase';
import { ModelInteractionService } from '../services';

export class MediaRoutes extends RouteBase {
    // public router!: Express.Router;
    
    constructor() {
        super({
            permittedQuery: {
                get: [ 'metatype' ],
                // post: [],
                // patch: [],
                // delete: [ '!id' ]
            },
            permittedBody: {
                // post: [ '!abs_url', '!job_title', '!company_name', 'role_type', 'yoe', 'keywords', 'severity', 'date_posted' ],
                // patch: [ '!_guid', '_applied', 'job_title', 'company_name', 'role_type', 'yoe', 'keywords', 'severity' ]
            },
            requiredHeader: {
                // post: {
                //     'Content-Type': 'application/json'
                // }
            }
        });
        
        this.app.use('/media', (req: Express.Request, res: Express.Response, next)=> {
            switch (req.method) {
                case 'GET':
                case 'POST':
                case 'PATCH':
                case 'DELETE': {
                    return next()
                }
                default: {
                    res.sendStatus(405);
                }
            }
        });
        this.app.use('/media', [ this.parsePermittedRouteOptions ]);
        this.app.get('/media/meta', [ this.getMeta ]);
        this.app.get('/media/asset', [ this.getMedia ]);
        
    }
    
    /** Simple function to get table row entries that are not of type _null_ from `meta` table
     * @param req 
     * - `{ req.query?: 'artists' | 'categories' }` if passed an object relative to the query given will be returned containing only items fitting those columns
     * @param res 
     * - `success` responds with `code 200` and `Array<string|typeof req.query>`
     * - `success` responsds with `204` if the library contains no entries
     * - `failure` responsd with `code 400` and `Error as string`
     */ 
    private getMeta = (req: Express.Request, res: Express.Response): void => {
        this.logger('MediaRoutes.getMeta')
        try {
            const queryType: typeof req.query.metatype = (function(){
                if (Object.entries(req.query).length > 0) {
                    if (req.query.metatype === undefined) {
                        throw new Error('Invalid query parameter provided')
                    } else if (req.query.metatype !== 'artists' && req.query.metatype !== 'categories') {
                        throw new Error('Invalid metatype query given')
                    } else {
                        return req.query.metatype
                    }
                }
                return undefined
            })();
            // ModelInteractionService
            //     .queryMetaColumns(queryType)
            //     .then((result): void =>{
            //         if (result instanceof Error) {
            //             throw result
            //         } else if (Object.keys(result).length === 0) {
            //             res.sendStatus(204);
            //         } else {
            //             res.status(200).send(result);
            //         }
            //     })
            //     .catch((err): void =>{
            //         this.emit('error', {
            //             error: err,
            //             severity: 2,
            //             response: res
            //         })
            //     });
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 2,
                response: res
            })
        }
    }
    /**
     * https://medium.com/@kylelibra/how-to-play-avi-files-in-the-chrome-web-browser-c5cbf8e0098d
     * https://www.npmjs.com/package/fluent-ffmpeg
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    private getMedia = (req: Express.Request, res: Express.Response): void => {
        this.logger('MediaRoutes.getMedia')
        try {
            if (!!req.query.file) {
                const range = req.headers.range;
    
                if (!range) {
                    res.status(400).send("Requires Range header");
                } else {
                    const videoPath = Path.join('', req.query.file);
                    const videoSize = Fs.statSync(videoPath).size;
                    
                    const start = Number(range.replace(/\D/g, ""));
                    const end = Math.min(start + (10 ** 9), videoSize - 1);
                    
                    // const videoStream = Fs.createReadStream(videoPath, { start, end, autoClose: true });
                    
                    res.writeHead(206, {
                        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": end - start + 1,
                        "Content-Type": "video/mp4",
                    });
                    Fs.createReadStream(videoPath, { start, end, autoClose: true })
                        .pipe(res)
                        .on('finish', ()=> {
                            console.log('- FINISH -')
                        })
                        .on('close', ()=> {
                            console.log('- CLOSE -')
                        })
                        .on('end', ()=> {
                            console.log('- END -')
                        });
                }
                
            }
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 2,
                response: res
            })
        }
        return
    }

}
// export const mediaRoute = new MediaRoutes();
// export default new MediaRoutes().router
