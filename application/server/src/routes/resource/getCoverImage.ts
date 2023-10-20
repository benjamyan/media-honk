import { z } from 'zod'
import { $Middleware, $Procedure } from "../trpc";
import { TRPCError } from '@trpc/server';
import { PathLike, createReadStream, existsSync } from 'fs';
import { CoversModel, MediaModel } from '../../models';
import { $FactoryCache } from '../../cache/FactoryServiceCache';
import { $ModelCache } from '../../cache/ModelCacheService';
import { $Fastify, $Logger } from '../../server';

/**
 * https://medium.com/@kylelibra/how-to-play-avi-files-in-the-chrome-web-browser-c5cbf8e0098d
 * https://www.npmjs.com/package/fluent-ffmpeg
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const getCoverImage = (
    $Procedure
        .input(z.object({ id:z.string() }))
        .query(async ({ input: { id } })=>{
            const bundleById = $FactoryCache.get(id);
            if (!bundleById) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'NO_BUNDLE'
                });
            }
            
            let coverImgUrl: string | undefined;
            if (bundleById !== undefined) {
                coverImgUrl = await CoversModel.getCoverRowById(bundleById._coverId).then((CoverRow)=> CoverRow?.file_url);
            }
            let MediaModelEntry;
            for await (const mediaId of bundleById._mediaEntries) {
                if (coverImgUrl !== undefined) break;
                MediaModelEntry = $ModelCache.get('media', mediaId);
                if (!MediaModelEntry) {
                    MediaModelEntry = await MediaModel.query().findById(mediaId);
                }
                coverImgUrl = await CoversModel.getCoverRowById(MediaModelEntry?.cover_img_id).then((CoverRow)=> {
                    if (CoverRow && CoverRow.file_url) {
                        $FactoryCache.set([{ ...bundleById, _coverId: CoverRow.id }]);
                        return CoverRow.file_url
                    }
                });
            }
            
            if (!coverImgUrl || !existsSync(coverImgUrl)) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'NO_COVER'
                });
            }
            // res.header('Content-Type', 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8')
            // res.type('image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
            // return createReadStream(coverImgUrl)
            // await res.sendFile(coverImgUrl) 
            return coverImgUrl
            // return res.sendFile(coverImgUrl) // .download(coverImgUrl, coverImgUrl.split('/').at(-1));
        })
)

// export const getCoverImage = async (req: Express.Request, res: Express.Response) => {
//     try {
//         if (!req.query.id) {
//             res.status(400).send('Required ID not provided');
//             return;
//         }
//         const bundleById = $FactoryCache.get(req.query.id);
//         if (!bundleById) {
//             res.status(409).send(`No bundle found with ID ${req.query.id}`);
//             return;
//         }
        
//         let coverImgUrl: string | undefined;
//         if (bundleById !== undefined) {
//             coverImgUrl = await CoversModel.getCoverRowById(bundleById._coverId).then((CoverRow)=> CoverRow?.file_url);
//         }
//         let MediaModelEntry;
//         for await (const mediaId of bundleById._mediaEntries) {
//             if (coverImgUrl !== undefined) break;
//             MediaModelEntry = $ModelCache.get('media', mediaId);
//             if (!MediaModelEntry) {
//                 MediaModelEntry = await MediaModel.query().findById(mediaId);
//             }
//             coverImgUrl = await CoversModel.getCoverRowById(MediaModelEntry?.cover_img_id).then((CoverRow)=> {
//                 if (CoverRow && CoverRow.file_url) {
//                     $FactoryCache.set([{ ...bundleById, _coverId: CoverRow.id }]);
//                     return CoverRow.file_url
//                 }
//             });
//         }
        
//         if (!coverImgUrl) {
//             res.sendStatus(204);
//         } else if (!existsSync(coverImgUrl)) {
//             res.sendStatus(404);
//         } else {
//             res.status(200).sendFile(coverImgUrl);
//         }
//         return;
//     } catch (err) {
//         // this.emit('error', {
//         //     error: err,
//         //     severity: 2,
//         //     response: res
//         // })
//     }
//     return
// }
