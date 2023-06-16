import express, { default as Express } from 'express';
import { existsSync } from 'fs';
import { RouteBase } from './_RouteBase';
import { $FactoryCache } from '../services/cache/FactoryServiceCache';
import { $ModelCache } from '../services/cache/ModelCacheService';
import { CoversModel, MediaModel } from '../models';

export class ResourceRoutes extends RouteBase {
    
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
        this.logger('- Established /resource');
        this.app.use('/resource', (req: Express.Request, res: Express.Response, next)=> {
            switch (req.method) {
                case 'GET': {
                    return next();
                }
                default: {
                    res.sendStatus(405);
                    return;
                }
            }
        });
        this.app.use('/resouce', [ this.parsePermittedRouteOptions ]);
        // this.app.use('/resouce/cover', );
        this.app.get('/resource/cover', [ /*express.static.bind(this, '/'), */this.getCoverImage ]);

    }

    /**
     * https://medium.com/@kylelibra/how-to-play-avi-files-in-the-chrome-web-browser-c5cbf8e0098d
     * https://www.npmjs.com/package/fluent-ffmpeg
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    private getCoverImage = async (req: Express.Request, res: Express.Response) => {
        try {
            if (!req.query.id) {
                res.status(400).send('Required ID not provided');
                return;
            }
            const bundleById = $FactoryCache.get(req.query.id);
            if (!bundleById) {
                res.status(409).send(`No bundle found with ID ${req.query.id}`);
                return;
            }
            
            let coverImgUrl: string | undefined;
            if (bundleById !== undefined) {
                coverImgUrl = await CoversModel.getCoverRowById(bundleById._coverId).then((CoverRow)=> CoverRow?.file_url);
            }
            let MediaModelEntry;
            for await (const mediaId of bundleById._mediaEntries) {
                if (coverImgUrl !== undefined) break;
                MediaModelEntry = $ModelCache.get('media', mediaId);
                if (!MediaModelEntry) {
                    MediaModelEntry = await MediaModel.query().findById(mediaId);
                }
                coverImgUrl = await CoversModel.getCoverRowById(MediaModelEntry?.cover_img_id).then((CoverRow)=> {
                    if (CoverRow && CoverRow.file_url) {
                        $FactoryCache.set([{ ...bundleById, _coverId: CoverRow.id }]);
                        return CoverRow.file_url
                    }
                });
            }
            
            if (!coverImgUrl) {
                res.sendStatus(204);
            } else if (!existsSync(coverImgUrl)) {
                res.sendStatus(404);
            } else {
                res.status(200).sendFile(coverImgUrl);
            }
            return;
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
