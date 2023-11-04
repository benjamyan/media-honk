import { TRPCError } from "@trpc/server";
import * as fastify from "fastify";
import { default as fp } from 'fastify-plugin'
import { default as Fs } from 'fs';
import { $Logger } from "../server";
import { InferMediaRouteResult } from "../types/trcp-utils";

const _streamImageMedia = function(_req: fastify.FastifyRequest, response: fastify.FastifyReply, filename: string) {
    response.type('image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
    return Fs.createReadStream(filename);
}
const _streamVideoMedia = function(request: fastify.FastifyRequest, response: fastify.FastifyReply, filename: string) {
    const { range } = request.headers;
    if (!range) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'MISSING REQUIRED RANGE HEADER'
        })
    }
    const size = Fs.statSync(filename).size;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + (10 ** 9), size - 1);
    
    const stream = (
        Fs.createReadStream(filename, { start, end, autoClose: true })
            // .on('data', (data)=>stream.destroy())
            .on('close', ()=> $Logger.warn('CLOSE'))
            .on('finish', ()=> $Logger.warn('FINISH'))
            .on('end', ()=> $Logger.warn('END'))
            .on('error', (err)=>$Logger.warn(err))
    );
    response.headers({
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4",
    });
    response.code(206);
    response.type('video/mp4');
    return stream
}
export type FastifyStreamReply = typeof _streamImageMedia | typeof _streamVideoMedia;
export const fastifyStream = fp(function(instance, _opts, done) {    
    instance.addHook('onSend', async (request, response, payload: string)=> {
        const _payload: InferMediaRouteResult<string> = JSON.parse(payload);
        if ((_payload.error || _payload.result == undefined) || typeof _payload.result.data !== 'string') {
            return payload
        }
        const originalUrl = request.url.split('?')[0];
        $Logger.info(originalUrl)
        switch (originalUrl) {
            case '/stream.image':
            case '/resource.cover': {
                return _streamImageMedia(request, response,_payload.result.data);
            }
            case '/stream.video': {
                return _streamVideoMedia(request, response, _payload.result.data);
            }
            default: {
                return payload;
            }
        }
        
        // const { range } = request.headers;
        // const fileType = getMediaExtFromFilename(_payload.result.data);
        // if (fileType === 'IMAGE') {
        //     return _streamImageMedia(request, response,_payload.result.data);
            // response.type('image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
            // return Fs.createReadStream(_payload.result.data);
        // } else if (fileType === 'VIDEO') {
        //     return _streamVideoMedia(request, response, _payload.result.data);
            // const videoSize = Fs.statSync(_payload.result.data).size;
            
            // const start = Number(range.replace(/\D/g, ""));
            // const end = Math.min(start + (10 ** 9), videoSize - 1);
            
            // const stream = (
            //     Fs.createReadStream(_payload.result.data, { start, end, autoClose: true })
            //         // .on('data', (data)=>stream.destroy())
            //         .on('close', ()=> $Logger.warn('CLOSE'))
            //         .on('finish', ()=> $Logger.warn('FINISH'))
            //         .on('end', ()=> $Logger.warn('END'))
            //         .on('error', (err)=>$Logger.warn(err))
            // );
            // response.headers({
            //     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            //     "Accept-Ranges": "bytes",
            //     "Content-Length": end - start + 1,
            //     "Content-Type": "video/mp4",
            // });
            // response.code(206);
            // response.type('video/mp4');
            // return stream
        // } else if (fileType === 'AUDIO') {
        //     throw new TRPCError({ code: 'NOT_IMPLEMENTED' })
        // }
        // return payload
    })
    done()
})
// export function fastifyStream(fastify: fastify.FastifyInstance, _opts: fastify.FastifyPluginOptions, done: any) {
//     fp(function(instance, opts, done) {    
//         $Logger.info('\n\nREGISTER\n\n');
//         instance.addHook('onSend', (request, response, payload)=> {
//             $Logger.info('\n\nHIIIII\n')
//             if (typeof(payload) !== 'string') {
//                 return payload;
//             }
    
//             const _payload: InferMediaRouteResult<string> = JSON.parse(payload);
//             if ((Object.keys(_payload).includes('error') || _payload.result == undefined) || typeof _payload.result.data !== 'string') {
//                 return payload;
//             }
            
//             const { range } = request.headers;
//             const fileType = getMediaExtFromFilename(_payload.result.data);
//             if (fileType === 'IMAGE') {
//                 return _streamImageMedia(request, response,_payload.result.data);
//                 // response.type('image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
//                 // return Fs.createReadStream(_payload.result.data);
//             } else if (fileType === 'VIDEO' && range !== undefined) {
//                 return _streamVideoMedia(request, response, _payload.result.data);
//                 // const videoSize = Fs.statSync(_payload.result.data).size;
                
//                 // const start = Number(range.replace(/\D/g, ""));
//                 // const end = Math.min(start + (10 ** 9), videoSize - 1);
                
//                 // const stream = (
//                 //     Fs.createReadStream(_payload.result.data, { start, end, autoClose: true })
//                 //         // .on('data', (data)=>stream.destroy())
//                 //         .on('close', ()=> $Logger.warn('CLOSE'))
//                 //         .on('finish', ()=> $Logger.warn('FINISH'))
//                 //         .on('end', ()=> $Logger.warn('END'))
//                 //         .on('error', (err)=>$Logger.warn(err))
//                 // );
//                 // response.headers({
//                 //     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//                 //     "Accept-Ranges": "bytes",
//                 //     "Content-Length": end - start + 1,
//                 //     "Content-Type": "video/mp4",
//                 // });
//                 // response.code(206);
//                 // response.type('video/mp4');
//                 // return stream
//             } else if (fileType === 'AUDIO') {
//                 throw new TRPCError({ code: 'NOT_IMPLEMENTED' })
//             }
//             return payload
//         })
//         done()
//     })
// }