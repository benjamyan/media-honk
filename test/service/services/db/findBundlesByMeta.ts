import { MetaModel, MediaMetaModel, BundleMediaModel, BundlesModel } from "../../models";
import { resolveBundle } from "./resolveBundle";

export const findBundlesByMetaField = async (metaColumn: 'artist_name' | 'category_name', metaValue: string)=> {
    const ResolvedBundles: Array<Honk.Server.AssetBundle> = [];

    try {
        const associatedColumn = MetaModel.associatedColumn(metaColumn);
        for (const queryValue of (metaValue.includes(',') ? metaValue.split(',') : [metaValue])) {
            const assetIdList = await (
                MediaMetaModel
                    .getRowsByMetaId({
                        metaCol: associatedColumn,
                        metaIds: await MetaModel.getRowIdsByValue(metaColumn, queryValue)
                    })
                    .then(async (mediaMeta)=>{
                        const mediaIdList = mediaMeta.map(({media_id})=>media_id);
                        return {
                            mediaIdList,
                            bundleMediaResult: await BundleMediaModel.getRowsByMediaId(mediaIdList)
                        }
                    })
                    .then(({ mediaIdList, bundleMediaResult })=> {
                        const bundleIdList = new Set<number>();
                        for (const bundleMediaRow of bundleMediaResult) {
                            if (mediaIdList.includes(bundleMediaRow.media_id)) {
                                bundleIdList.add(bundleMediaRow.bundle_id);
                            }
                        }
                        return { 
                            media: mediaIdList,
                            bundles:  [...bundleIdList]
                        }
                    })
            );
            for await (const bundleId of assetIdList.bundles) {
                const ResolvedBundle = await BundlesModel.query().select().findById(bundleId).then((Bundle)=> {
                    if (Bundle) return resolveBundle(Bundle)
                });
                if (ResolvedBundle) ResolvedBundles.push(ResolvedBundle);
            }
        }
        
        return ResolvedBundles
    } catch (err) {
        console.log(err)
        return err instanceof Error ? err : new Error(`An unknown exception occured.`)
    }
    
}
