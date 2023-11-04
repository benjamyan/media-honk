import { z } from 'zod'
import { $Middleware, $Procedure } from "../trpc";
import { BundleMediaModel, MediaModel } from '../../models';
import { $FactoryCache } from '../../cache/FactoryServiceCache';
import { $ModelCache } from '../../cache/ModelCacheService';
import { TRPCError } from '@trpc/server';
import { default as Path } from 'path';
import {default as Fs} from 'fs'

/**
 * https://medium.com/@kylelibra/how-to-play-avi-files-in-the-chrome-web-browser-c5cbf8e0098d
 * https://www.npmjs.com/package/fluent-ffmpeg
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const streamVideo = (
    $Procedure
        .input(z.object({ 
            id: z.string(),
            entry: z.string().optional()
        }))
        // .use($Middleware(({ ctx, next })=>{
        //     if (ctx.req.headers.range == undefined) {
        //         throw new TRPCError({ code: 'BAD_REQUEST' })
        //     }
        //     return next()
        // }))
        // .use($Middleware((params)=>{
        //     params.ctx.res.serializer
        //     return params.next()
        // }))
        .query(async ({ input: { id, entry }, ctx: { req, res } })=>{
            /** Get the associated bundle based on id passed from query param */
            const Bundle = $FactoryCache.get(id);
            if (!Bundle) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'NO_BUNDLE'
                });
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
                    ? foundMediaBundles.find(({media_index})=> media_index === parseInt(entry))
                    : foundMediaBundles[0]
            );
            if (!MediaBundle) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'NO_MEDIA_BUNDLE'
                });
            }
            /** Get the media table entry so its file can be referenced and streamed */
            let MediaEntry = $ModelCache.get('media', MediaBundle.media_id) || await MediaModel.query().findById(MediaBundle.media_id);
            if (!MediaEntry) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'NO_MEDIA'
                })
            }
            return MediaEntry.abs_url
            // const range = req.headers.range!;
            // const videoPath = Path.join('', MediaEntry.abs_url);
            // const videoSize = Fs.statSync(videoPath).size;
            
            // const start = Number(range.replace(/\D/g, ""));
            // const end = Math.min(start + (10 ** 9), videoSize - 1);
            
            // res.headers({
            //     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            //     "Accept-Ranges": "bytes",
            //     "Content-Length": end - start + 1,
            //     "Content-Type": "video/mp4",
            // });
            // // res.statusCode = 206;
            // const stream = Fs.createReadStream(videoPath, { start, end, autoClose: true })
            //     .on('finish', ()=> {
            //         console.log('- FINISH -')
            //         res.status(200);
            //     })
            //     .on('close', ()=> {
            //         console.log('- CLOSE -')
            //         res.status(200);
            //     })
            //     .on('end', ()=> {
            //         console.log('- END -')
            //         res.status(200);
            //     });
            // res.type('video/mp4').code(206).send(stream);
            
            // return res


            // if (!range) {

            //     res.status(400).send("Requires Range header");
            // } else {
            //     const videoPath = Path.join('', MediaEntry.abs_url);
            //     const videoSize = Fs.statSync(videoPath).size;
                
            //     const start = Number(range.replace(/\D/g, ""));
            //     const end = Math.min(start + (10 ** 9), videoSize - 1);
            
                // res.writeHead(206, {
                //     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                //     "Accept-Ranges": "bytes",
                //     "Content-Length": end - start + 1,
                //     // "Content-Type": "rtmp/mp4",
                //     "Content-Type": "video/mp4",
                // });
                // Fs.createReadStream(videoPath, { start, end, autoClose: true })
                //     .pipe(res)
                //     .on('finish', ()=> {
                //         console.log('- FINISH -')
                //     })
                //     .on('close', ()=> {
                //         console.log('- CLOSE -')
                //     })
                //     .on('end', ()=> {
                //         console.log('- END -')
                //     });
            // }
            // throw new TRPCError({
            //     code: 'NOT_IMPLEMENTED',
            //     message: 'todo'
            // });
        })
)
