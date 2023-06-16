import { default as Express } from 'express';
import { MetaModel, MediaMetaModel, MediaModel, BundlesModel, BundleMediaModel, CoversModel } from "../models";
import { MediaHonkServerBase } from "../_Base";
import { $ModelCache } from "./cache/ModelCacheService";
import { v4 as uuidV4 } from 'uuid';
import { $FactoryCache } from './cache/FactoryServiceCache';

let ProcedureServiceIntermediary: ProcedureService = null!;

class ProcedureService {
    private constructor() {}

    static get instance() {
        if (ProcedureServiceIntermediary === null) {
            ProcedureServiceIntermediary = new ProcedureService();
        }
        return ProcedureServiceIntermediary
    }

    private async AssetBundleResolver(BundleEntry: BundlesModel, mediaIdList?: number[]) {
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
            
            $FactoryCache.set([ResolvedBundle]);
            return ResolvedBundle
        } catch (err) {
            console.log(err)
            return 
        }
    }

    public async getAllBundles() {
        const ResolvedBundles: Array<Honk.Server.AssetBundle> = [];
        try {
            const bundles = await BundlesModel.query().select();
            let ResolvedBundle;
            for (const bundle of bundles) {
                ResolvedBundle = await this.AssetBundleResolver(bundle);
                if (ResolvedBundle === undefined) continue;
                ResolvedBundles.push(ResolvedBundle);
            }
        } catch (err) {
            console.log(err);
        }
        return ResolvedBundles
    }

    public async getBundlesByMetaField(metaColumn: 'artist_name' | 'category_name', metaValue: string) {
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
                        if (Bundle) return this.AssetBundleResolver(Bundle)
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

}

export const $ProcedureService = ProcedureService.instance;
