// / <reference path='../../server.d.ts' />

import { default as Express } from 'express';

import { RouteBase } from './_RouteBase';
import { BundleMediaModel, BundlesModel, CoversModel, MediaMetaModel, MediaModel, MetaModel, MetaModelColumn } from '../models';
import { resolve } from 'path';

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
        this.app.get('/media/meta', [ this.getMeta ]);
        this.app.get('/media/bundles', [ this.getBundles ]);
        
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
     * 
     * 
     * @returns Results that _explicitely_ match, where the only values returned are those matching ALL parameters
     * Array of objects:
     * - bundle_id <Number> direct ID ref that can be queried
     * - main_title <String> title of the bundle
     * - sub_title <String | null> subtitle (if available)
     * - categories <String[]> applicable categories
     * - artists <String[]> applicable artists
     * - cover_img_url <String | null> cover image by URL
     * - length <number>
     * - type <string>
     */
    private getBundles = async ({ query, ...req }: Express.Request, res: Express.Response) => {
        try {
            type BundleIntermediaryBucket = {
                resolved: Array<{
                    bundle_id: number;
                    main_title: string;
                    sub_title: string | undefined;
                    categories: string[];
                    artists: string[];
                    cover_img_url: string | undefined;
                    length: number;
                    type: string;
                }>;
                associations: Array<{
                    metaId: number;
                    _ids: {
                        bundles: Set<number>;
                        media: Set<number>;
                        covers: Set<number>;
                        meta: Set<number>;
                        artists: Set<number>;
                        categories: Set<number>;
                    }
                }>;
                _cache: {
                    meta: Map<number, MetaModel>;
                    media_meta: Map<number, MediaMetaModel>;
                    media: Map<number, MediaModel>;
                    bundles: Map<number, BundlesModel>;
                    bundles_media: Map<number, BundleMediaModel>;
                    covers: Map<number, CoversModel>;
                };
                _idList: Partial<Record<keyof BundleIntermediaryBucket['associations'][any]['_ids'], Set<number>>>,
                listId: (name: keyof typeof BundleIntermediary._idList)=> Array<number>;
            };
            const BundleIntermediary: BundleIntermediaryBucket = {
                resolved: [],
                associations: [],
                _idList: {},
                _cache: {
                    meta: new Map(),
                    media: new Map(),
                    media_meta: new Map(),
                    bundles: new Map(),
                    bundles_media: new Map(),
                    covers: new Map()
                },
                listId(name) {
                    let idList: Set<number>;
                    if (this._idList[name] === undefined) {
                        idList = new Set();
                        for (const entry of Object.values(this.associations)) {
                            entry._ids[name].forEach((id)=> idList.add(id));
                        }
                        this._idList[name] = idList;
                    }
                    return Array.from((this._idList[name] as Set<number>).values());
                }
            };
            const getInitialMetaRows = async ({
                queryMetaFields,
                columnName
            }:{
                queryMetaFields: string;
                columnName: keyof MetaModelColumn;
            })=> {
                const foundRows: typeof BundleIntermediary.associations = [];
                const associateColumn = columnName == 'artist_name' ? 'category_name' : 'artist_name'
                for (const meta of queryMetaFields.split(',')) {
                    metaQuery = MetaModel.getRowsByColumn({
                        artist: columnName === 'artist_name' ? meta : undefined,
                        category: columnName === 'category_name' ? meta : undefined,
                        includeRefs: [associateColumn]
                    });
                    await metaQuery().then(async (metaResult)=> {
                    
                        const matchingMetaRow = metaResult.find((row)=>row[columnName] === meta);
                        if (!matchingMetaRow) return;
                        
                        const _associationEntry: typeof BundleIntermediary.associations[any] = {
                            metaId: matchingMetaRow.id,
                            _ids: {
                                media: new Set(),
                                bundles: new Set(),
                                meta: new Set(),
                                covers: new Set(),
                                artists: new Set(),
                                categories: new Set()
                            }
                        };
                        
                        for (const metaRow of metaResult) {
                            BundleIntermediary._cache.meta.set(metaRow.id, metaRow)
                            for (const row in metaRow) {
                                let _appendRow: MetaModel | undefined,
                                    _resolvedCol: keyof typeof _associationEntry._ids,
                                    _metaRowId = metaRow[row as keyof typeof metaRow];
                                if (_metaRowId === null) continue;
                                _associationEntry._ids.meta.add(metaRow.id)
                                switch (row) {
                                    case 'artist_name': 
                                    case 'category_name': {
                                        _resolvedCol = row == 'artist_name' ? 'artists' : 'categories';
                                        _associationEntry._ids[_resolvedCol].add(metaRow.id);
                                        break;
                                    }
                                    case 'category_id':
                                    case 'artist_id': {
                                        _resolvedCol = row == 'artist_id' ? 'artists' : 'categories';
                                        _appendRow = metaResult.find(({ id })=> id == _metaRowId );
                                        if (_appendRow !== undefined) {
                                            _associationEntry._ids[_resolvedCol].add(_appendRow.id);
                                        }
                                        break;
                                    }
                                    case 'id':
                                    default: {
                                        //
                                    }
                                }
                            }
                        }
                        
                        foundRows.push(_associationEntry);
                    });
                }
                return foundRows
            }
            let metaQuery: ReturnType<typeof MetaModel.getRowsByColumn>;

            if (!!query.artist) {
                BundleIntermediary.associations = [
                    ...BundleIntermediary.associations,
                    ...await getInitialMetaRows({
                        queryMetaFields: query.artist,
                        columnName: 'artist_name'
                    })
                ]
            }
            if (!!query.category) {
                BundleIntermediary.associations = [
                    ...BundleIntermediary.associations,
                    ...await getInitialMetaRows({
                        queryMetaFields: query.category,
                        columnName: 'category_name'
                    })
                ]
            }
            
            for await (const entry of BundleIntermediary.associations) {
                await (
                    MediaMetaModel
                        .query()
                        .select()
                        .modify((qb)=>{
                            if (!!query.artist) qb.whereRaw("meta_artist_id = " + Array.from(entry._ids.artists.values()).map(_ => '?').join(' OR meta_artist_id = '), [...entry._ids.artists.values()])
                            if (!!query.category) qb.whereRaw("meta_category_id = " + Array.from(entry._ids.categories.values()).map(_ => '?').join(' OR meta_category_id = '), [...entry._ids.categories.values()])
                        })
                        .then((mediaMeta)=>{
                            for (const media of mediaMeta) {
                                BundleIntermediary._cache.media_meta.set(media.media_id, media);
                                for (const entry of BundleIntermediary.associations) {
                                    if (!!query.artist && entry.metaId === media.meta_artist_id) entry._ids.media.add(media.media_id);
                                    if (!!query.category && entry.metaId === media.meta_category_id) entry._ids.media.add(media.media_id);
                                }
                            }
                        })
                )
                await (
                    BundleMediaModel
                        .query()
                        .select()
                        .whereRaw("media_id = " + Array.from(entry._ids.media).map(_ => '?').join(' OR media_id = '), [...Array.from(entry._ids.media)])
                        .then((bundleMediaResult)=> {
                            Object.values(BundleIntermediary.associations).forEach((row)=>{
                                for (const bundleMedia of bundleMediaResult) {
                                    if (row._ids.media.has(bundleMedia.media_id)) {
                                        row._ids.bundles.add(bundleMedia.bundle_id);
                                    }
                                    BundleIntermediary._cache.bundles_media.set(bundleMedia.media_id, bundleMedia)
                                }
                            })
                        })
                );
                await (
                    MediaModel
                        .query()
                        .select()
                        .whereRaw("id = " + Array.from(entry._ids.media).map(_ => '?').join(' OR id = '), [...Array.from(entry._ids.media)])
                        .then((mediaResult)=> {
                            for (const mediaRow of mediaResult) {
                                BundleIntermediary._cache.media.set(mediaRow.id, mediaRow);
    
                                if (!mediaRow.cover_img_id) continue;
                                for (const { _ids: { media, covers } } of Object.values(BundleIntermediary.associations)) {
                                    if (media.has(mediaRow.id)) covers.add(mediaRow.cover_img_id);
                                }
                            }
                        })
                );
                await (
                    CoversModel
                        .query()
                        .select()
                        .whereRaw("id = " + Array.from(entry._ids.covers).map(_ => '?').join(' OR id = '), [...Array.from(entry._ids.covers)])
                        .then((coverResults)=> {
                            for (const coverRow of coverResults) {
                                BundleIntermediary._cache.covers.set(coverRow.id, coverRow);
                            }
                        })
                );
                for await (const bundleId of entry._ids.bundles.values()) {
                    const resolvedBundle: BundleIntermediaryBucket['resolved'][any] = {
                        bundle_id: bundleId,
                        main_title: '',
                        sub_title: '',
                        categories: Array.from(entry._ids.categories).map((categoryId)=>{
                                const currentArtist = BundleIntermediary._cache.meta.get(categoryId);
                                if (currentArtist && currentArtist.category_name) {
                                    return currentArtist.category_name
                                }
                            })
                            .filter(Boolean) as string[],
                        artists: Array.from(entry._ids.artists).map((artistId)=>{
                                const currentArtist = BundleIntermediary._cache.meta.get(artistId);
                                if (currentArtist && currentArtist.artist_name) {
                                    return currentArtist.artist_name
                                }
                            })
                            .filter(Boolean) as string[],
                        cover_img_url: '',
                        length: 0,
                        type: ''
                    };
                    const bundleEntry = await BundlesModel.query().select().findById(bundleId);
                    if (bundleEntry) {
                        BundleIntermediary._cache.bundles.set(bundleEntry.id, bundleEntry)
                        resolvedBundle.main_title = bundleEntry.main_title;
                        resolvedBundle.sub_title = bundleEntry.sub_title;
                        if (bundleEntry.custom_cover_id) {
                            resolvedBundle.cover_img_url = BundleIntermediary._cache.covers.get(bundleEntry.custom_cover_id)?.file_url;
                        }
                    }
                    
                    const mediaItems: number[] = [];
                    BundleIntermediary._cache.bundles_media.forEach((bundleMedia)=>{
                        if (bundleMedia.bundle_id == bundleId) mediaItems.push(bundleMedia.media_id);
                    });
                    for (const mediaId of mediaItems) {
                        const mediaEntry = BundleIntermediary._cache.media.get(mediaId);
                        
                        if (!resolvedBundle.cover_img_url && mediaEntry?.cover_img_id) {
                            resolvedBundle.cover_img_url = BundleIntermediary._cache.covers.get(mediaEntry.cover_img_id)?.file_url;
                        }
                        if (!resolvedBundle.type && mediaEntry?.media_type) {
                            resolvedBundle.type = mediaEntry.media_type;
                        }
                        if (resolvedBundle.cover_img_url && resolvedBundle.type) break;
                    }
                    
                    resolvedBundle.length = mediaItems.length;
                    BundleIntermediary.resolved.push({...resolvedBundle})
                }
            }
            
            // if (!!req.query.maintitle) {}
            // if (!!req.query.subtitle) {}
            if (!Array.isArray(BundleIntermediary.resolved)) {
                throw new Error('Invalid request result');
            } else if (BundleIntermediary.resolved.length == 0) {
                res.sendStatus(204);
                return;
            }
            res.statusCode = 200;
            res.json(BundleIntermediary.resolved);
            res.send();
            return;
        } catch (err) {
            console.log(err)
        }
    }
    
}
