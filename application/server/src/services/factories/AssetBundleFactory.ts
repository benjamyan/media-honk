import { v4 as uuidV4 } from 'uuid';
import { BundleMediaModel, BundlesModel, BundlesModelColumns, CoversModel, MediaMetaModel, MediaModel, MetaModel, MetaModelColumns, ModelTableColumns, ModelTables } from '../../models';
import { $FactoryCache } from '../cache/FactoryServiceCache';
import { $ModelCache } from '../cache/ModelCacheService';

type AssetResolutionFactoryEntity = {
    readonly asset: Honk.Media.AssetBundle;
};
type AssetResolutionFactoryProps = {
    bundle: BundlesModelColumns
} & { 
    [Table in keyof ModelTableColumns]?: Array<ModelTableColumns[Table]> 
};

// const getBundleRow = ()=> {
//     const bundleEntry = await BundlesModel.query().select().findById(this.bundleRow.id);
//     if (!bundleEntry) {
//         console.error(`Cannot find row with ID of: ${this.bundleRow.id}`);
//         return;
//     }
//     this.bundleRow = bundleEntry;
//     this.asset.title = bundleEntry.main_title;
//     this.asset.subTitle = bundleEntry.sub_title;
// }

// const generateUniqueGuid = ()=> {
//     const newGuid = uuidV4();
//     if (!$FactoryCache.get(newGuid)) {
//         return newGuid;
//     }
//     return this.generateUniqueGuid();
// }

// const getBundleCoverImage = (coverImgId: number)=> {
//     const coverCacheEntry = $ModelCache.get('covers', coverImgId);
//     let coverImgUrl;
//     if (coverCacheEntry) {
//         coverImgUrl = coverCacheEntry.file_url;
//     } else {
//         const coverImage = await CoversModel.query().findById(coverImgId);
//         if (coverImage) {
//             coverImgUrl = coverImage.file_url;
//         }
//     }
//     return coverImgUrl as string;
// }

// const getMetaColValuesByMediaId = (colName: 'artist_name' | 'category_name')=> {
//     const mediaMetaColName: keyof MediaMetaModel = `meta_${colName == 'artist_name' ? 'artist_id' : 'category_id'}`;
//     const mediaById: Set<number> = new Set();
//     const metaRowByColName: string[] = [];
//     for (const id of this.mediaIdList) {
//         $ModelCache.media_meta.forEach((mediaMetaRow)=> {
//             if (mediaMetaRow.media_id == id && typeof(mediaMetaRow[mediaMetaColName]) == 'number') {
//                 mediaById.add(mediaMetaRow[mediaMetaColName] as number);
//             }
//         });
//     }
//     await (
//         MetaModel.query().findByIds([...mediaById.values()]).then(async (metaRows)=> {
//             let metaQueryRow: keyof MetaModelColumns;
//             for await (const metaRow of metaRows) {
//                 metaQueryRow = colName == 'artist_name' ? 'artist_id' : 'category_id';
//                 if (metaRow[metaQueryRow] !== null) {
//                     await (
//                         MetaModel
//                             .query()
//                             .findById(metaRow[metaQueryRow] as number)
//                             .then((row)=>{
//                                 if (row && row[colName]) metaRowByColName.push(row[colName] as string) 
//                             })
//                     )
//                 } else {
//                     metaRowByColName.push(metaRow[colName] as string)
//                 }
//             }
//         })
//     )
//     return metaRowByColName;
// }

// const getOtherFieldsThisIsTempName = ()=> {
//     const mediaItems = (
//         [...$ModelCache.bundles_media.values()].filter((bundleMedia)=>bundleMedia.bundle_id == this.bundleRow.id)
//     );
//     for await (const mediaId of mediaItems.flatMap(({media_id})=>media_id)) {
//         if (!!this.asset.coverImgUrl && !!this.asset.type) break;
        
//         const mediaEntry = await MediaModel.query().findById(mediaId);
//         if (!mediaEntry) break;

//         if (!this.asset.coverImgUrl && mediaEntry?.cover_img_id) {
//             this.asset.coverImgUrl = await this.getBundleCoverImage(mediaEntry.cover_img_id);
//         }
//         if (!this.asset.type && mediaEntry?.media_type) {
//             this.asset.type = mediaEntry.media_type;
//         }
//     }
// }

// export const AssetBundleFactory = async (props: AssetResolutionFactoryProps)=> {
//     const asset: Honk.Media.AssetBundle = {
//         _guid: generateUniqueGuid(),
//         title: undefined!,
//         subTitle: undefined!,
//         coverImgUrl: undefined!,
//         category: undefined!,
//         artist: undefined!,
//         length: undefined!,
//         type: undefined!,
//     }
//     const _bundleRow: BundlesModelColumns = {
//         id: props.Bundle.id,
//         main_title: props.Bundle.main_title,
//         sub_title: props.Bundle.sub_title,
//         custom_cover_id: props.Bundle.custom_cover_id,
//         media_type: props.Bundle.media_type
//     };
//     const _mediaIdList: number[] = await (
//         MediaMetaModel
//             .getRowsByMetaId({
//                 metaCol: entry._related.column,
//                 metaIds: [...entry._related.rows.flatMap(({id})=> id), entry.metaId]
//             })
//             .then(async (mediaMeta)=>{
//                 const mediaIdList = mediaMeta.map(({id})=>id);
                
//                 return {
//                     mediaIdList,
//                     bundleMedia: await BundleMediaModel.getRowsByMediaId({ mediaIds: mediaIdList })
//                 }
//             })
//             .then(({ mediaIdList, bundleMedia })=> {
//                 Object.values(BundleIntermediary.associations).forEach((row)=>{
//                     for (const bundleMedia of bundleMediaResult) {
//                         if (mediaIds.includes(bundleMedia.media_id)) {
//                             row._ids.bundles.add(bundleMedia.bundle_id);
//                         }
//                     }
//                 })
//             })
//     );
//     /** Column IDs from each table that have some sort of association with the specific entry */
//     const _associations: { [Key in keyof ModelTables]: Set<number> } = {
//         meta: new Set(),
//         media: new Set(),
//         media_meta: new Set(),
//         bundles: new Set(),
//         bundles_media: new Set(),
//         covers: new Set()
//     };
//     /** Columns that have the `initialValues` param present */
//     const _relationships: {
//         [Table in keyof ModelTableColumns]?: Array<ModelTableColumns[Table]>
//     } = {};

//     return asset
// }
