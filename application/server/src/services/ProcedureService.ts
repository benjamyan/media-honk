import { MetaModel, MetaModelColumns, MediaMetaModel, MediaModel, BundlesModel, BundleMediaModel, CoversModel } from "../models";
import { MediaHonkServerBase } from "../_Base";
import { $ModelCache } from "./common/ModelCacheService";

let ProcedureServiceIntermediary: ProcedureService = null!;

class ProcedureService extends MediaHonkServerBase {
    constructor() {
        super();

    }

    static get instance() {
        if (ProcedureServiceIntermediary === null) {
            ProcedureServiceIntermediary = new ProcedureService();
        }
        return ProcedureServiceIntermediary
    }
    
    public async getBundlesByMetaField(params: { artist: string, category: string }) {
        const { artist, category }  = params;
        type BundleIntermediaryBucket = {
            resolved: Array<Honk.Media.MediaBundle>;
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
                    column: keyof Pick<MetaModelColumns, 'artist_id'|'category_id'>;
                };
            }>;
            _idList: Partial<Record<keyof BundleIntermediaryBucket['associations'][any]['_ids'], Set<number>>>,
            listId: (name: keyof typeof BundleIntermediary._idList)=> Array<number>;
        };
        const BundleIntermediary: BundleIntermediaryBucket = {
            resolved: [],
            associations: [],
            _idList: {},
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
            columnName: keyof Pick<MetaModelColumns, 'artist_name' | 'category_name'>;
        })=> {
            const foundRows: typeof BundleIntermediary.associations = [];
            for await (const columnValue of queryMetaFields.split(',')) {
                const metaQuery = await MetaModel.getAssociatedRowsByValue({
                    column: columnName, 
                    value: columnValue
                });
                const metaRow = metaQuery.find((metaRow)=> metaRow[columnName] == columnValue);
                if (metaQuery.length == 0 || !metaRow) continue;
                
                foundRows.push({
                    metaId: metaRow.id,
                    _ids: {
                        media_meta: new Set(),
                        bundles: new Set(),
                        meta: new Set<number>().add(metaRow.id),
                        covers: new Set(),
                        artists: new Set(),
                        categories: new Set()
                    },
                    _related: {
                        rows: metaQuery.filter((row)=> row.id !== metaRow.id), 
                        column: MetaModel.associatedColumn(columnName)
                    }
                });
            }
            return foundRows
        };
        if (!!artist) {
            BundleIntermediary.associations = [
                ...BundleIntermediary.associations,
                ...await getInitialMetaRows({
                    queryMetaFields: artist,
                    columnName: 'artist_name'
                })
            ]
        }
        if (!!category) {
            BundleIntermediary.associations = [
                ...BundleIntermediary.associations,
                ...await getInitialMetaRows({
                    queryMetaFields: category,
                    columnName: 'category_name'
                })
            ]
        }
        
        for await (const entry of BundleIntermediary.associations) {
            const mediaIds: number[] = [];
            await (
                MediaMetaModel
                    .getRowsByMetaId({
                        metaCol: entry._related.column,
                        metaIds: [...entry._related.rows.flatMap(({id})=> id), entry.metaId]
                    })
                    .then((mediaMeta)=>{
                        for (const media of mediaMeta) {
                            mediaIds.push(media.media_id);
                            entry._ids.media_meta.add(media.id);
                        }
                    })
            );
            await BundleMediaModel.getRowsByMediaId({ mediaIds }).then((bundleMediaResult)=> {
                Object.values(BundleIntermediary.associations).forEach((row)=>{
                    for (const bundleMedia of bundleMediaResult) {
                        if (mediaIds.includes(bundleMedia.media_id)) {
                            row._ids.bundles.add(bundleMedia.bundle_id);
                        }
                    }
                })
            })
            for await (const bundleId of entry._ids.bundles.values()) {
                const resolvedBundle: BundleIntermediaryBucket['resolved'][any] = {
                    _guid: 'super-unique-id',
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
                    const coverCacheEntry = $ModelCache.get('covers', coverImgId);
                    let coverImgUrl;
                    if (coverCacheEntry) {
                        coverImgUrl = coverCacheEntry.file_url;
                    } else {
                        const coverImage = await CoversModel.query().findById(coverImgId);
                        if (coverImage) {
                            coverImgUrl = coverImage.file_url;
                        }
                    }
                    return coverImgUrl as string;
                };
                const getMetaRowValues = async (colName: 'artist_name' | 'category_name')=> {
                    const mediaMetaColName: keyof MediaMetaModel = `meta_${colName == 'artist_name' ? 'artist_id' : 'category_id'}`;
                    const mediaById: Set<number> = new Set();
                    const metaRowByColName: string[] = [];
                    for (const id of mediaIds) {
                        $ModelCache.media_meta.forEach((mediaMetaRow)=> {
                            if (mediaMetaRow.media_id == id && typeof(mediaMetaRow[mediaMetaColName]) == 'number') {
                                mediaById.add(mediaMetaRow[mediaMetaColName] as number);
                            }
                        });
                    }
                    await (
                        MetaModel.query().findByIds([...mediaById.values()]).then(async (metaRows)=> {
                            let metaQueryRow: keyof MetaModelColumns;
                            for await (const metaRow of metaRows) {
                                metaQueryRow = colName == 'artist_name' ? 'artist_id' : 'category_id';
                                if (metaRow[metaQueryRow] !== null) {
                                    await (
                                        MetaModel
                                            .query()
                                            .findById(metaRow[metaQueryRow] as number)
                                            .then((row)=>{
                                                if (row && row[colName]) metaRowByColName.push(row[colName] as string) 
                                            })
                                    )
                                } else {
                                    metaRowByColName.push(metaRow[colName] as string)
                                }
                            }
                        })
                    )
                    return metaRowByColName;
                }
                const bundleEntry = await BundlesModel.query().select().findById(bundleId);

                if (bundleEntry) {
                    resolvedBundle.main_title = bundleEntry.main_title;
                    resolvedBundle.sub_title = bundleEntry.sub_title;
                    if (bundleEntry.custom_cover_id) {
                        resolvedBundle.cover_img_url = await getBundleCoverImage(bundleEntry.custom_cover_id);
                    }
                }
                
                const mediaItems = (
                    [...$ModelCache.bundles_media.values()].filter((bundleMedia)=>bundleMedia.bundle_id == bundleId)
                );
                for await (const mediaId of mediaItems.flatMap(({media_id})=>media_id)) {
                    if (!!resolvedBundle.cover_img_url && !!resolvedBundle.type) break;
                    
                    const mediaEntry = await MediaModel.query().findById(mediaId);
                    if (!mediaEntry) break;

                    if (!resolvedBundle.cover_img_url && mediaEntry?.cover_img_id) {
                        resolvedBundle.cover_img_url = await getBundleCoverImage(mediaEntry.cover_img_id);
                    }
                    if (!resolvedBundle.type && mediaEntry?.media_type) {
                        resolvedBundle.type = mediaEntry.media_type;
                    }
                }

                resolvedBundle.artist = await getMetaRowValues('artist_name');
                resolvedBundle.category = await getMetaRowValues('category_name');
                resolvedBundle.length = mediaItems.length;

                BundleIntermediary.resolved.push({...resolvedBundle});
            }
        }
        
        return BundleIntermediary.resolved
    }
    
}

export const $ProcedureService = ProcedureService.instance;
