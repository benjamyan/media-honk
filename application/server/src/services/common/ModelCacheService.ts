import { MetaModel, MediaMetaModel, MediaModel, BundlesModel, BundleMediaModel, CoversModel, ModelTables } from "../../models";
import { MediaHonkServerBase } from "../../_Base";

let CacheServiceIntermediary: ModelCacheService = null!;

interface ModelCacheServiceModule {
    readonly meta: Map<MetaModel['id'], MetaModel>;
    readonly media_meta: Map<MediaMetaModel['id'], MediaMetaModel>;
    readonly media: Map<MediaModel['id'], MediaModel>;
    readonly bundles: Map<BundlesModel['id'], BundlesModel>;
    readonly bundles_media: Map<BundleMediaModel['bundle_id'], BundleMediaModel>;
    readonly covers: Map<CoversModel['id'], CoversModel>;
}
// type CacheServiceModule = {
//     [Key in keyof Omit<ModelTables, 'bundles_media'>]: Map<ModelTables[Key]['id'], ModelTables[Key]>;
// }
// type CacheServiceModule2 = CacheServiceMapped & {
//     bundles_media: Map<BundleMediaModel['media_id'], BundleMediaModel>;
// }

export class ModelCacheService implements ModelCacheServiceModule {
    readonly meta: Map<number, MetaModel> = new Map();
    readonly media_meta: Map<number, MediaMetaModel> = new Map();
    readonly media: Map<number, MediaModel> = new Map();
    readonly bundles: Map<BundlesModel['id'], BundlesModel> = new Map();
    readonly bundles_media: Map<BundleMediaModel['bundle_id'], BundleMediaModel> = new Map();
    readonly covers: Map<CoversModel['id'], CoversModel> = new Map();

    private constructor() {}
    
    static get instance() {
        if (CacheServiceIntermediary === null) {
            CacheServiceIntermediary = new ModelCacheService();
        }
        return CacheServiceIntermediary
    }
    
    public set<T extends keyof ModelTables>(values: Array<ModelTables[T]>) {
        switch(values[0].$modelClass) {
            case CoversModel:
            case MediaModel:
            case MediaMetaModel:
            case MetaModel:
            case BundlesModel: {
                values.forEach((value)=> {
                    /// @ts-expect-error
                    this[values[0].$modelClass.tableName].set(value.id, value)
                })
                break;
            }
            case BundleMediaModel: {
                (values as BundleMediaModel[]).forEach((value)=> {
                    this.bundles_media.set(value.media_id, value)
                })
                break;
            }
            default: {
                MediaHonkServerBase.emitter('error', {
                    name: `ERR_CACHE_SERVICE`,
                    message: ``,
                    severity: 2
                })
                return false
            }
        }
        return true

        // if (values[0] instanceof BundlesModel) {
        //     (values as BundlesModel[]).forEach((value)=> {
        //         this.bundles.set(value.id, value)
        //     })
        // } else if (values[0] instanceof MediaModel) {
        //     (values as MediaModel[]).forEach((value)=> {
        //         this.media.set(value.id, value)
        //     })
        // } else if (values[0] instanceof MetaModel) {
        //     (values as MetaModel[]).forEach((value)=> {
        //         this.meta.set(value.id, value)
        //     })
        // } else if (values[0] instanceof MediaMetaModel) {
        //     (values as MediaMetaModel[]).forEach((value)=> {
        //         this.media_meta.set(value.id, value)
        //     })
        // } else if (values[0] instanceof BundleMediaModel) {
        //     (values as BundleMediaModel[]).forEach((value)=> {
        //         this.bundles_media.set(value.media_id, value)
        //     })
        // } else if (values[0] instanceof CoversModel) {
        //     (values as CoversModel[]).forEach((value)=> {
        //         this.covers.set(value.id, value)
        //     })
        // } else {
        //     MediaHonkServerBase.emitter('error', {
        //         name: `ERR_CACHE_SERVICE`,
        //         message: ``,
        //         severity: 2
        //     })
        //     return false
        // }
        // return true
    }

    public get<T extends keyof ModelTables, C extends number | Partial<{ [Column in keyof T]: T[Column] }>>(table: T, column: C) {
        let cacheEntry;
        if (typeof(column) == 'number') {
            cacheEntry = this[table].get(column);
        } else {
            cacheEntry = [];
            this[table].forEach((entry)=> {
                for (const row in column) {
                    if (entry[row as keyof typeof entry] !== column[row]) return;
                }
                cacheEntry.push(entry as ModelTables[T]);
            })
        }

        return cacheEntry as ( C extends number ? (ModelTables[T] | undefined) : Array<ModelTables[T]> );
        // return cacheEntry as undefined | ( C extends number ? ModelTables[T] : Array<ModelTables[T]> );
    }

}
