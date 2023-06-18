import { default as Fs } from 'node:fs';
import { default as Path } from 'node:path';
import { default as Express } from 'express';
import { RouteBase } from './_RouteBase';
import { $ModelCache } from '../services/cache/ModelCacheService';
import { $FactoryCache } from '../services/cache/FactoryServiceCache';
import { BundleMediaModel, BundlesModel, MediaModel } from '../models';

export class StreamRoutes extends RouteBase {
    
    constructor() {
        super({
            permittedQuery: {
                get: [ 'id', 'entry' ],
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
        this.app.get('/stream/image', [ this.streamImageMedia ]);
        this.app.get('/stream/video', [ this.streamVideoEntry ]);
        
    }

    private streamImageMedia = async (req: Express.Request, res: Express.Response)=> {
        const { id, entry } = req.query;
        if (!id) {
            res.status(404).send('Requires ID parameter');
            return;
        }
        /** Get the associated bundle based on id passed from query param */
        const Bundle = $FactoryCache.get(id);
        if (!Bundle) {
            res.status(404).send('No bundle with given ID found');
            return;
        }
        /** Get the BundleMedia rows where bundle ID matches */
        let foundMediaBundles = $ModelCache.get('bundles_media', { bundle_id: Bundle._bundleId });
        if (!Array.isArray(foundMediaBundles) || foundMediaBundles.length == 0) {
            /** If none are found, query for them in database */
            foundMediaBundles = await BundleMediaModel.query().select().where('bundle_id', Bundle._bundleId)
        }
        /** If the media index was passed in, find it in the media bundles; if not, select the first one available */
        const MediaBundle = (
            entry !== undefined
                ? foundMediaBundles.find(({media_index})=> media_index === parseInt(entry))
                : foundMediaBundles[0]
        );
        if (!MediaBundle) {
            res.status(404).send('No media associated with the found bundle');
            return;
        }
        /** Get the media table entry so its file can be referenced and streamed */
        let MediaEntry = $ModelCache.get('media', MediaBundle.media_id) || await MediaModel.query().findById(MediaBundle.media_id);
        if (!MediaEntry) {
            res.status(404).send('Could not locate playable media');
            return;
        }
        res.status(200).sendFile(MediaEntry.abs_url);
        return;
    }

    /**
     * https://medium.com/@kylelibra/how-to-play-avi-files-in-the-chrome-web-browser-c5cbf8e0098d
     * https://www.npmjs.com/package/fluent-ffmpeg
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    private streamVideoEntry = async (req: Express.Request, res: Express.Response) => {
        try {
            const { id, entry } = req.query;
            if (!id) {
                res.status(404).send('Requires ID parameter');
                return;
            }
            /** Get the associated bundle based on id passed from query param */
            const Bundle = $FactoryCache.get(id);
            if (!Bundle) {
                res.status(404).send('No bundle with given ID found');
                return;
            }
            /** Get the BundleMedia rows where bundle ID matches */
            let foundMediaBundles = $ModelCache.get('bundles_media', { bundle_id: Bundle._bundleId });
            if (!Array.isArray(foundMediaBundles) || foundMediaBundles.length == 0) {
                /** If none are found, query for them in database */
                foundMediaBundles = await BundleMediaModel.query().select().where('bundle_id', Bundle._bundleId)
            }
            /** If the media index was passed in, find it in the media bundles; if not, select the first one available */
            const MediaBundle = (
                entry !== undefined
                    ? foundMediaBundles.find(({media_index})=> media_index === parseInt(entry))
                    : foundMediaBundles[0]
            );
            if (!MediaBundle) {
                res.status(404).send('No media associated with the found bundle');
                return;
            }
            /** Get the media table entry so its file can be referenced and streamed */
            let MediaEntry = $ModelCache.get('media', MediaBundle.media_id) || await MediaModel.query().findById(MediaBundle.media_id);
            if (!MediaEntry) {
                res.status(404).send('Could not locate playable media');
                return;
            }
            const range = req.headers.range;

            if (!range) {
                res.status(400).send("Requires Range header");
            } else {
                const videoPath = Path.join('', MediaEntry.abs_url);
                const videoSize = Fs.statSync(videoPath).size;
                
                const start = Number(range.replace(/\D/g, ""));
                const end = Math.min(start + (10 ** 9), videoSize - 1);
                
                res.writeHead(206, {
                    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": end - start + 1,
                    // "Content-Type": "rtmp/mp4",
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
