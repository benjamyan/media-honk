import { default as Express } from 'express';
import { MetaModel, MetaModelColumns, MediaMetaModel, MediaModel, BundlesModel, BundleMediaModel, CoversModel } from "../models";
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

    private async resolveNewAssetBundle(BundleEntry: BundlesModel, mediaIdList?: number[]) {
        try {
            if (!BundleEntry) throw new Error(`Invalid bundle given to resolver`);
            let resolvedBundle: Honk.Media.AssetBundle = {
                _guid: uuidV4(),
                title: BundleEntry.main_title,
                subTitle: BundleEntry.sub_title,
                category: [],
                artist: [],
                coverImgUrl: '',
                length: 0,
                type: BundleEntry.media_type
            };
            const relatedMediaIdList = mediaIdList || await BundleMediaModel.getRowsByBundleId(BundleEntry.id);
            if (!Array.isArray(relatedMediaIdList) || relatedMediaIdList.length == 0) {
                throw new Error(`Failed to find bundles_media where bundle_id = ${BundleEntry.id}`);
            }
            
            if (BundleEntry.custom_cover_id) {
                resolvedBundle.coverImgUrl = await CoversModel.getCoverImageById(BundleEntry.custom_cover_id);
            }
            
            for await (const mediaId of relatedMediaIdList) {
                if (!!resolvedBundle.coverImgUrl && !!resolvedBundle.type) break;
                
                const mediaEntry = await MediaModel.query().findById(mediaId);
                if (!mediaEntry) break;
    
                if (!resolvedBundle.coverImgUrl && mediaEntry?.cover_img_id) {
                    resolvedBundle.coverImgUrl = await CoversModel.getCoverImageById(mediaEntry.cover_img_id);
                }
            }
    
            resolvedBundle.artist = await MetaModel.getValuesByMediaId('artist_name', relatedMediaIdList);
            resolvedBundle.category = await MetaModel.getValuesByMediaId('category_name', relatedMediaIdList);
            resolvedBundle.length = relatedMediaIdList.length;

            $FactoryCache.set([resolvedBundle]);
            return resolvedBundle
        } catch (err) {
            console.log(err)
            return 
        }
    }

    public async getAllBundles() {
        const resolvedBundles: Array<Honk.Media.AssetBundle> = [];
        try {
            const bundles = await BundlesModel.query().select();
            let resolvedBundle;
            for (const bundle of bundles) {
                resolvedBundle = await this.resolveNewAssetBundle(bundle);
                if (resolvedBundle === undefined) continue;
                resolvedBundles.push(resolvedBundle);
            }
        } catch (err) {
            console.log(err);
        }
        return resolvedBundles
    }

    public async getBundlesByMetaField(metaColumn: 'artist_name' | 'category_name', metaValue: string) {
        const resolvedBundles: Array<Honk.Media.AssetBundle> = [];

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
                    const resolvedBundle = await BundlesModel.query().select().findById(bundleId).then((Bundle)=> {
                        if (Bundle) return this.resolveNewAssetBundle(Bundle)
                    });
                    if (resolvedBundle) resolvedBundles.push(resolvedBundle);
                }
            }
            
            return resolvedBundles
        } catch (err) {
            console.log(err)
            return err instanceof Error ? err : new Error(`An unknown exception occured.`)
        }
        
    }
    
}

export const $ProcedureService = ProcedureService.instance;
