import { v4 as uuidV4 } from 'uuid'
import { MediaHonkServerBase } from '../../_Base';
import { BundlesModel, CoversModel, MediaMetaModel, MetaModel, MetaModelColumns, ModelTableColumns, ModelTables } from '../../models';
import { $FactoryCache } from '../cache/FactoryServiceCache';
import { $ModelCache } from '../cache/ModelCacheService';

type AssetResolutionFactoryEntity = Honk.Media.AssetBundle;
type AssetResolutionFactoryProps = {
    // bundleId: number;
    mediaIds: number[];
    associations: { [Key in keyof ModelTables]: Set<number> };
    relationships: { [Table in keyof ModelTableColumns]?: Array<ModelTableColumns[Table]> };
};
export interface AssetResolutionFactory extends AssetResolutionFactoryEntity {}

export class AssetResolution implements AssetResolutionFactory {
    readonly _guid = this.generateUniqueGuid();
    readonly bundle_id!: number;
    readonly main_title!: string;
    readonly sub_title!: string | undefined;
    readonly category!: string[];
    readonly artist!: string[];
    readonly cover_img_url!: string | undefined;
    readonly length!: number;
    readonly type!: string;
    
    private mediaIdList!: number[];
    private bundleRow!: BundlesModel;
    /** Column IDs from each table that have some sort of association with the specific entry */
    private associations: { 
        [Key in keyof ModelTables]: Set<number> 
    } = {
        meta: new Set(),
        media: new Set(),
        media_meta: new Set(),
        bundles: new Set(),
        bundles_media: new Set(),
        covers: new Set()
    };
    /** Columns that have the `initialValues` param present */
    private relationships: {
        [Table in keyof ModelTableColumns]?: Array<ModelTableColumns[Table]>
    } = {};

    constructor({ mediaIds, associations, relationships }: AssetResolutionFactoryProps) {
        this.mediaIdList = [...mediaIds];
        this.associations = { ...associations };
        this.relationships = { ...relationships };
    }

    public async init() {
        try {
            await this.getBundleRow();
        } catch (err) {
            MediaHonkServerBase.emitter('error', {
                error: err,
                severity: 2
            })
        }
    }

    private async getBundleRow() {
        const bundleEntry = await BundlesModel.query().select().findById(this.bundle_id);
        if (!bundleEntry) {
            console.error(`Cannot find row with ID of: ${this.bundle_id}`);
            return;
        }
        this.bundleRow = bundleEntry;
    }

    private generateUniqueGuid(): string {
        const newGuid = uuidV4();
        if (!$FactoryCache.get(newGuid)) {
            return newGuid;
        }
        return this.generateUniqueGuid();
    }

    // TODO
    private async getBundleCoverImage(coverImgId: number) {
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

    private async getMetaRowValues(colName: 'artist_name' | 'category_name') {
        const mediaMetaColName: keyof MediaMetaModel = `meta_${colName == 'artist_name' ? 'artist_id' : 'category_id'}`;
        const mediaById: Set<number> = new Set();
        const metaRowByColName: string[] = [];
        for (const id of this.mediaIdList) {
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

}
