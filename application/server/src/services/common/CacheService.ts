import { MetaModel, MediaMetaModel, MediaModel, BundlesModel, BundleMediaModel, CoversModel, ModelTables } from "../../models";
import { MediaHonkServerBase } from "../../_Base";

let CacheServiceIntermediary: CacheService = null!;

export class CacheService {
    readonly meta: Map<number, MetaModel> = new Map();
    readonly media_meta: Map<number, MediaMetaModel> = new Map();
    readonly media: Map<number, MediaModel> = new Map();
    readonly bundles: Map<number, BundlesModel> = new Map();
    readonly bundles_media: Map<number, BundleMediaModel> = new Map();
    readonly covers: Map<number, CoversModel> = new Map();

    private constructor() {}
    
    static get instance() {
        if (CacheServiceIntermediary === null) {
            CacheServiceIntermediary = new CacheService();
        }
        return CacheServiceIntermediary
    }
    
    public set<T extends keyof ModelTables>(tableName: T, values: Array<ModelTables[T]>): boolean {
        switch(tableName) {
            case 'bundles': {
                (values as BundlesModel[]).forEach((value)=> {
                    this.bundles.set(value.id, value)
                })
                break;
            }
            case 'bundles_media': {
                (values as BundleMediaModel[]).forEach((value)=> {
                    this.bundles_media.set(value.bundle_id, value)
                })
                break;
            }
            case 'covers': {
                (values as CoversModel[]).forEach((value)=> {
                    this.covers.set(value.id, value)
                })
                break;
            }
            case 'media': {
                (values as MediaModel[]).forEach((value)=> {
                    this.media.set(value.id, value)
                })
                break;
            }
            case 'media_meta': {
                (values as MediaMetaModel[]).forEach((value)=> {
                    this.media_meta.set(value.id, value)
                })
                break;
            }
            case 'meta': {
                (values as MetaModel[]).forEach((value)=> {
                    this.meta.set(value.id, value)
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
    }

    public get<T extends keyof ModelTables>(tableName: T, values: number | { column: string, value: any }) {

    }

}
