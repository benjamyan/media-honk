import { MediaHonkServerBase } from '../../_Base';
import { ModelTableColumns, ModelTables } from '../../models';

export interface BundleResolutionFactory {
    readonly _guid: Honk.Media.MediaBundle['_guid'];
    readonly resolved: Honk.Media.MediaBundle;
}
type BundleAssocationRelations = {
    [Key in keyof ModelTables]: {
        rows: Array<ModelTables[Key]>;
        column: Key;
    }
}
type BundleResolutionParams = { 
    [Table in keyof ModelTableColumns]?: { 
        [Column in keyof ModelTableColumns[Table]]?: ModelTableColumns[Table][Column] 
    } 
}

export class BundleResolution implements BundleResolutionFactory {
    readonly _guid!: Honk.Media.MediaBundle['_guid'];
    readonly resolved!: Honk.Media.MediaBundle;
    private associations: Partial<{ [Key in keyof ModelTables]: number }> & {
        ids: { [Key in keyof ModelTables]: Set<number> };
        relations: Array<Partial<BundleAssocationRelations[keyof ModelTables]>>;
    } = {
        ids: {
            meta: new Set(),
            media: new Set(),
            media_meta: new Set(),
            bundles: new Set(),
            bundles_media: new Set(),
            covers: new Set(),
        },
        relations: []
    }

    constructor(tableValues: BundleResolutionParams) {
        
    }

    public async init() {
        try {
            
        } catch (err) {
            MediaHonkServerBase.emitter('error', {
                error: err,
                severity: 2
            })
        }
    }

    
    
}

// type BundleIntermediaryBucket = {
//     resolved: Array<>;
//     associations: Array<{
//         metaId: number;
//         _ids: {
//             bundles: Set<number>;
//             media_meta: Set<number>;
//             covers: Set<number>;
//             meta: Set<number>;
//             artists: Set<number>;
//             categories: Set<number>;
//         };
//         _related: {
//             rows: MetaModel[];
//             column: keyof Pick<MetaModelColumns, 'artist_id'|'category_id'>;
//         };
//     }>;
//     _cache: {
//         meta: Map<number, MetaModel>;
//         media_meta: Map<number, MediaMetaModel>;
//         media: Map<number, MediaModel>;
//         bundles: Map<number, BundlesModel>;
//         bundles_media: Map<number, BundleMediaModel>;
//         covers: Map<number, CoversModel>;
//     };
//     _idList: Partial<Record<keyof BundleIntermediaryBucket['associations'][any]['_ids'], Set<number>>>,
//     listId: (name: keyof typeof BundleIntermediary._idList)=> Array<number>;
// };
