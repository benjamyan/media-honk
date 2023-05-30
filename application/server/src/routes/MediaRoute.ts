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
                    category: string[];
                    artist: string[];
                    cover_img_url: string | undefined;
                    length: number;
                    type: string;
                }>;
                associations: Array<{
                    metaId: number;
                    _ids: {
                        bundles: Set<number>;
                        media_meta: Set<number>;
                        covers: Set<number>;
                        meta: Set<number>;
                        artists: Set<number>;
                        categories: Set<number>;
                    };
                    _related: {
                        rows: MetaModel[];
                        type: keyof MetaModelColumn;
                    };
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
                const relatedIdColumn = columnName == 'artist_name' ? 'artist_id' : 'category_id';
                for await (const columnValue of queryMetaFields.split(',')) {
                    const metaQuery = await MetaModel.query().select().where(columnName, columnValue);
                    if (metaQuery.length == 0) {
                        continue;
                    } else if (metaQuery.length > 1) {
                        throw new Error('More than one field found.')
                    }

                    const metaRow = metaQuery[0];
                    
                    const _associationEntry: typeof BundleIntermediary.associations[any] = {
                        metaId: metaRow.id,
                        _ids: {
                            media_meta: new Set(),
                            bundles: new Set(),
                            meta: new Set(),
                            covers: new Set(),
                            artists: new Set(),
                            categories: new Set()
                        },
                        _related: {
                            rows: await MetaModel.query().select().where(relatedIdColumn, metaRow.id), 
                            type: relatedIdColumn
                        }
                    };
                    _associationEntry._ids.meta.add(metaRow.id);
                    BundleIntermediary._cache.meta.set(metaRow.id, metaRow);

                    foundRows.push(_associationEntry);
                }
                return foundRows
            };
            
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
                            const mediaMetaCol = entry._related.type == 'artist_id' ? 'meta_artist_id' : 'meta_category_id';
                            const metaRowIds = entry._related.rows.flatMap(({id})=> id);
                            metaRowIds.push(entry.metaId);
                            qb.whereRaw(`${mediaMetaCol} = ` + metaRowIds.map(_ => '?').join(` OR ${mediaMetaCol} = `), [...metaRowIds]);
                        })
                        .then((mediaMeta)=>{
                            for (const media of mediaMeta) {
                                BundleIntermediary._cache.media_meta.set(media.media_id, media);
                                entry._ids.media_meta.add(media.media_id);
                            }
                        })
                );
                await (
                    BundleMediaModel
                        .query()
                        .select()
                        .whereRaw("media_id = " + Array.from(entry._ids.media_meta).map(_ => '?').join(' OR media_id = '), [...Array.from(entry._ids.media_meta)])
                        .then((bundleMediaResult)=> {
                            Object.values(BundleIntermediary.associations).forEach((row)=>{
                                for (const bundleMedia of bundleMediaResult) {
                                    if (row._ids.media_meta.has(bundleMedia.media_id)) {
                                        row._ids.bundles.add(bundleMedia.bundle_id);
                                    }
                                    BundleIntermediary._cache.bundles_media.set(bundleMedia.media_id, bundleMedia)
                                }
                            })
                        })
                );
                for await (const bundleId of entry._ids.bundles.values()) {
                    const resolvedBundle: BundleIntermediaryBucket['resolved'][any] = {
                        bundle_id: bundleId,
                        main_title: '',
                        sub_title: '',
                        category: [],
                        artist: [],
                        cover_img_url: '',
                        length: 0,
                        type: ''
                    };
                    const getBundleCoverImage = async (coverImgId: number)=> {
                        const coverCacheEntry = BundleIntermediary._cache.covers.get(coverImgId);
                        let coverImgUrl;
                        if (coverCacheEntry) {
                            coverImgUrl = coverCacheEntry.file_url;
                        } else {
                            const coverImage = await CoversModel.query().findById(coverImgId);
                            if (coverImage) {
                                BundleIntermediary._cache.covers.set(coverImage.id, coverImage);
                                coverImgUrl = coverImage.file_url;
                            }
                        }
                        return coverImgUrl as string;
                    };
                    const getMetaRowValues = async (colName: 'artist_name' | 'category_name', mediaList: BundleMediaModel[])=> {
                        const mediaMetaColName: keyof MediaMetaModel = `meta_${colName == 'artist_name' ? 'artist_id' : 'category_id'}`;
                        const mediaById: Set<number> = new Set();
                        let currentMediaMeta;
                        for (const media of mediaList) {
                            currentMediaMeta = BundleIntermediary._cache.media_meta.get(media.media_id);
                            if (!!currentMediaMeta && typeof(currentMediaMeta[mediaMetaColName]) == 'number') {
                                mediaById.add(currentMediaMeta[mediaMetaColName] as number)
                            }
                        }
                        const metaRows = await MetaModel.query().findByIds([...mediaById.values()]);
                        console.log(mediaById)
                        return metaRows.filter((row)=>row[colName] !== null).flatMap((metaRow)=>metaRow[colName]) as string[]
                    }
                    const bundleEntry = await BundlesModel.query().select().findById(bundleId);

                    if (bundleEntry) {
                        BundleIntermediary._cache.bundles.set(bundleEntry.id, bundleEntry)
                        resolvedBundle.main_title = bundleEntry.main_title;
                        resolvedBundle.sub_title = bundleEntry.sub_title;
                        if (bundleEntry.custom_cover_id) {
                            resolvedBundle.cover_img_url = await getBundleCoverImage(bundleEntry.custom_cover_id);
                        }
                    }
                    
                    const mediaItems = (
                        [...BundleIntermediary._cache.bundles_media.values()].filter((bundleMedia)=>bundleMedia.bundle_id == bundleId)
                    );

                    for await (const mediaId of mediaItems.flatMap(({media_id})=>media_id)) {
                        if (!!resolvedBundle.cover_img_url && !!resolvedBundle.type) break;
                        
                        const mediaEntry = await MediaModel.query().findById(mediaId);
                        if (!mediaEntry) break;

                        BundleIntermediary._cache.media.set(mediaEntry.id, mediaEntry);
                        if (!resolvedBundle.cover_img_url && mediaEntry?.cover_img_id) {
                            resolvedBundle.cover_img_url = await getBundleCoverImage(mediaEntry.cover_img_id);
                        }
                        if (!resolvedBundle.type && mediaEntry?.media_type) {
                            resolvedBundle.type = mediaEntry.media_type;
                        }
                    }

                    resolvedBundle.artist = await getMetaRowValues('artist_name', mediaItems);
                    resolvedBundle.category = await getMetaRowValues('category_name', mediaItems);
                    resolvedBundle.length = mediaItems.length;

                    BundleIntermediary.resolved.push({...resolvedBundle})
                    console.log(entry._ids)
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
