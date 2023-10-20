import { BundlesModel, BundleMediaModel, MetaModel } from "../../models";
import { $FactoryCache } from "../../cache/FactoryServiceCache";
import { v4 as uuidV4 } from 'uuid';

export const resolveBundle = async (BundleEntry: BundlesModel, mediaIdList?: number[])=> {
    try {
        if (!BundleEntry) throw new Error(`Invalid bundle given to resolver`);
        const relatedMediaIdList = mediaIdList || await BundleMediaModel.getRowsByBundleId(BundleEntry.id);
        if (!Array.isArray(relatedMediaIdList) || relatedMediaIdList.length == 0) {
            throw new Error(`Failed to find bundles_media where bundle_id = ${BundleEntry.id}`);
        }
        const ResolvedBundle: Honk.Server.AssetBundle = {
            _guid: uuidV4(),
            _bundleId: BundleEntry.id,
            _coverId: BundleEntry.custom_cover_id,
            _mediaEntries: [...relatedMediaIdList],
            title: BundleEntry.main_title,
            subTitle: BundleEntry.sub_title,
            category: [],
            artist: [],
            type: BundleEntry.media_type
        };
        await Promise.all([
            MetaModel.getValuesByMediaId('artist_name', relatedMediaIdList),
            MetaModel.getValuesByMediaId('category_name', relatedMediaIdList)
        ]).then(([ artists, categories ])=> {
            ResolvedBundle.artist = [...artists];
            ResolvedBundle.category = [...categories];
        });
        
        const ExistingBundle = $FactoryCache.get(ResolvedBundle);
        if (ExistingBundle) {
            return ExistingBundle;
        } else {
            $FactoryCache.set([ResolvedBundle]);
            return ResolvedBundle
        }
    } catch (err) {
        console.log(err)
        return 
    }
}