import { default as Fs } from 'node:fs';
import { default as Path } from 'node:path';
import { default as Express } from 'express';
import { RouteBase } from './_RouteBase';
import { $ModelCache } from '../services/cache/ModelCacheService';
import { $FactoryCache } from '../services/cache/FactoryServiceCache';

export class StreamRoutes extends RouteBase {
    
    constructor() {
        super({
            permittedQuery: {
                get: [ 'id' ],
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
        
        this.logger('- Established /stream');
        this.app.use('/stream', (req: Express.Request, res: Express.Response, next)=> {
            switch (req.method) {
                case 'GET': {
                    return next();
                }
                default: {
                    res.sendStatus(405);
                }
            }
        });
        this.app.use('/stream', [ this.parsePermittedRouteOptions ]);
        this.app.get('/stream/video', [ this.streamVideoEntry ]);
        
    }

    /**
     * https://medium.com/@kylelibra/how-to-play-avi-files-in-the-chrome-web-browser-c5cbf8e0098d
     * https://www.npmjs.com/package/fluent-ffmpeg
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    private streamVideoEntry = (req: Express.Request, res: Express.Response): void => {
        try {
            const { id, entry } = req.params;
            if (!id) {
                res.status(404).send('Requires ID parameter');
                return;
            }
            
            const Bundle = $FactoryCache.get(id);
            if (!Bundle) {
                res.sendStatus(404);
                return;
            }

            const foundMediaBundles = $ModelCache.get('bundles_media', { bundle_id: Bundle._bundleId });
            const MediaBundle = (
                entry !== undefined
                    ? foundMediaBundles.find(({media_index})=> media_index && media_index === parseInt(entry))
                    : foundMediaBundles[0]
            );
            if (!MediaBundle) {
                res.sendStatus(404);
                return;
            }
            
            const range = req.headers.range;

            if (!range) {
                res.status(400).send("Requires Range header");
            } else {
                const videoPath = $ModelCache.get('bundles', Bundle._bundleId);
                // const videoPath = Path.join('', req.query.file);
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
