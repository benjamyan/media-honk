import { z } from 'zod'
import { $Procedure } from "../trpc";
import { BundleMediaModel, MediaModel } from '../../models';
import { $FactoryCache } from '../../services/cache/FactoryServiceCache';
import { $ModelCache } from '../../services/cache/ModelCacheService';

/**
 * https://medium.com/@kylelibra/how-to-play-avi-files-in-the-chrome-web-browser-c5cbf8e0098d
 * https://www.npmjs.com/package/fluent-ffmpeg
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const getStaticAsset = (
    $Procedure
        .input(z.object({ id: z.string(), entry: z.number() }))
        .query(async ({ input: { id, entry }, ctx: { res } }) => {
            /** Get the associated bundle based on id passed from query param */
            const Bundle = $FactoryCache.get(id);
            if (!Bundle) {
                return res.code(404);
            }
            /** Get the BundleMedia rows where bundle ID matches */
            let foundMediaBundles = $ModelCache.get('bundles_media', { bundle_id: Bundle._bundleId });
            if (!Array.isArray(foundMediaBundles) || foundMediaBundles.length == 0) {
                /** If none are found, query for them in database */
                foundMediaBundles = await BundleMediaModel.query().select().where('bundle_id', Bundle._bundleId)
            }
            /** If the media index was passed in, find it in the media bundles; if not, select the first one available */
            const MediaBundle = (
                entry !== undefined
                    ? foundMediaBundles.find(({ media_index }) => media_index === entry)
                    : foundMediaBundles[0]
            );
            if (!MediaBundle) {
                return res.code(404);
            }
            /** Get the media table entry so its file can be referenced and streamed */
            let MediaEntry = $ModelCache.get('media', MediaBundle.media_id) || await MediaModel.query().findById(MediaBundle.media_id);
            if (!MediaEntry) {
                return res.code(404);
            }
            // res.header('Content-Length', );
            return res.download(MediaEntry.abs_url, MediaEntry.abs_url.split('/').at(-1));
        })
)
