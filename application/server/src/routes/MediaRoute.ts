// / <reference path='../../server.d.ts' />

import { default as Express } from 'express';

import { RouteBase } from './_RouteBase';
import { $ProcedureService } from '../services/ProcedureService';
import { BundlesModel, MetaModel } from '../models';
import { StoredMediaTypes } from '../types/MediaProperties';

export class MediaRoutes extends RouteBase {
    
    constructor() {
        super({
            permittedQuery: {
                get: [ 'metatype', 'category', 'artist' ],
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
                case 'GET': {
                    return next();
                }
                default: {
                    res.sendStatus(405);
                }
            }
        });
        this.app.use('/media', [ this.parsePermittedRouteOptions ]);
        this.app.get('/media/types', [ this.getMediaTypes ]);
        this.app.get('/media/paginated', [ this.getPaginatedBundles ]);
        this.app.get('/media/meta', [ this.getMeta ]);
        this.app.get('/media/bundles', [ this.getBundles ]);
    }

    /**
     * @method getPaginatedBundles A route handler to get a limited number of bundles by media type
     * @param req 
     * @param res 
     */
    private getPaginatedBundles = async (req: Express.Request, res: Express.Response)=> {
        try {
            // const paginatedBundles = await (
            //     BundlesModel
            //         .query()
            //         .select()
            // );
            res.sendStatus(204);
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 2,
                response: res
            })
        }
    }
    
    /**
     * @method getMediaTypes A route handler to get a limited number of bundles by media type
     * @param req 
     * @param res 
     */
    private getMediaTypes = async (req: Express.Request, res: Express.Response)=> {
        try {
            const mediaTypes = await (
                BundlesModel
                    .query()
                    .select('media_type')
                    .then((bundles)=> {
                        const mediaTypeWithCount: Partial<Record<StoredMediaTypes, number>> = {};
                        bundles.forEach((bundle)=> {
                            if (mediaTypeWithCount[bundle.media_type] == undefined) {
                                mediaTypeWithCount[bundle.media_type] = 0;
                            }
                            mediaTypeWithCount[bundle.media_type]!++;
                        })
                        return mediaTypeWithCount
                    })
            );
            if (Object.keys(mediaTypes).length == 0) {
                res.sendStatus(204);
                return;
            }
            res.statusCode = 200;
            res.json(mediaTypes);
            res.send();
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 2,
                response: res
            })
        }
    }

    /** 
     * @method getMeta Simple function to get table row entries that are not of type _null_ from `meta` table
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
                    } else if (req.query.metatype !== 'artist_name' && req.query.metatype !== 'category_name') {
                        throw new Error('Invalid metatype query given')
                    }
                    return req.query.metatype
                }
                return undefined
            })();
            MetaModel
                .getAllMetaRowContent(queryType)
                .then((result): void =>{
                    if (result instanceof Error) {
                        throw result
                    } else if (Object.keys(result).length === 0) {
                        res.sendStatus(204);
                    } else {
                        res.status(200).send(result);
                    }
                })
                .catch((err): void =>{
                    this.emit('error', {
                        error: err,
                        severity: 2,
                        response: res
                    })
                });
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 2,
                response: res
            })
        }
    }

    /**
     * 
     * @param query Can accept either `artist` and/or `category` as a properly formatted URL query parameter
     * - Ex. `artist=Foo+Bar,Baz,Bozz&category=Lorem+Ipsum,Dolor+Sit,Amet`
     * 
     * @param res Results that _explicitely_ match, where the only values returned are those matching ALL parameters
     * Array of objects:
     * - `bundle_id` <Number> direct ID ref that can be queried
     * - `main_title` <String> title of the bundle
     * - `sub_title` <String | null> subtitle (if available)
     * - `categories` <String[]> applicable categories
     * - `artists` <String[]> applicable artists
     * - `cover_img_url` <String | null> cover image by URL
     * - `length` <number>
     * - `type` <string>
     */
    private getBundles = async ({ query }: Express.Request, res: Express.Response) => {
        try {
            const Bundles = await $ProcedureService.getBundlesByMetaField({
                artist: query.artist || '',
                category: query.category || ''
            });

            if (!Array.isArray(Bundles)) {
                throw new Error('Invalid request result');
            } else if (Bundles.length == 0) {
                res.sendStatus(204);
                return;
            }
            res.statusCode = 200;
            res.json(Bundles);
            res.send();
            return;
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 2,
                response: res
            })
        }
    }
    
}
