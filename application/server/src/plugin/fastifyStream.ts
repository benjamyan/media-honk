import { TRPCError } from "@trpc/server";
import * as fastify from "fastify";
import { default as fp } from 'fastify-plugin'
import { default as Fs } from 'fs';
import { $Logger } from "../server";
import { InferMediaRouteResult } from "../types/trcp-utils";
import { pipeline } from "stream";

// https://github.com/fastify/help/issues/526
// https://snyk.io/blog/node-js-file-uploads-with-fastify/
// https://stackoverflow.com/questions/74006606/fastify-stream-closed-prematurely
// https://github.com/fastify/fastify/issues/805

const _streamImageMedia = function(_req: fastify.FastifyRequest, response: fastify.FastifyReply, filename: string) {
    response.type('image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
    response.status(200);
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
    // let Stream: any = undefined!;
    // const closeStream = ()=> {
    //     if (Stream !== undefined) Stream.destroy()
    // };
    // request.
    
    // Stream = pipeline(
    //     File,
    //     response,
    //     (err)=> $Logger.warn(err)
    // );
    // response.raw.writable(true);
    // response.raw.writeHead(206, {
    //     "Content-Range": `bytes ${start}-${end}/${size}`,
    //     "Accept-Ranges": "bytes",
    //     "Content-Length": end - start + 1,
    //     "Content-Type": "video/mp4",
    // });

    // const Stream = Fs.createReadStream(filename, { start, end, autoClose: true });
    // const Pipeline = pipeline(Stream, response.raw, (err: any)=> $Logger.warn(err));
    // Pipeline.shouldKeepAlive = true;
    // Pipeline.statusCode = 206;
    // Pipeline.addTrailers([
    //     ["Accept-Ranges", "bytes"],
    //     ["Content-Length", String(end - start + 1)],
    //     ['Content-Type', 'video/mp4'],
    //     ["Content-Range", `bytes ${start}-${end}/${size}`]
    // ]);
    // Pipeline.socket?.on('end', ()=> {
    //     Pipeline.shouldKeepAlive = false;
    //     Stream.destroy();
    //     Pipeline.flushHeaders();
    //     Pipeline.end();
    // });
    // return Pipeline.socket;

    // WORKS w/ single premture close error 
    $Logger.warn(filename);
    const Stream = Fs.createReadStream(filename, { start, end, autoClose: true, emitClose: true });
    const Pipeline = pipeline(Stream, response.raw, (err: any)=> {
        $Logger.warn('Custom error:')
        $Logger.warn(err);
        Pipeline.flushHeaders();
        Pipeline.shouldKeepAlive = false;
        Stream.destroy();
        Pipeline.end();
        Pipeline.socket?.end();
    });
    const handlePipelineClose = (name: string)=> {
        $Logger.warn(name);
        // Stream.destroy();
        // Stream.close();
        Pipeline.flushHeaders();
        Pipeline.shouldKeepAlive = false;
        Stream.destroy();
        Pipeline.end();
        Pipeline.socket?.end();
    };


    response.headers({
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4",
    });
    response.code(206);
    response.type('video/mp4');
    // Pipeline.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
    // Pipeline.setHeader("Accept-Ranges", "bytes");
    // Pipeline.setHeader("Content-Length", end - start + 1);
    // Pipeline.setHeader("Content-Type", "video/mp4");
    // Pipeline.statusCode = 206;
    Pipeline.shouldKeepAlive = true;
    // Pipeline.addTrailers({
    //     "Content-Range": `bytes ${start}-${end}/${size}`,
    //     "Accept-Ranges": "bytes",
    //     "Content-Length": end - start + 1,
    //     "Content-Type": "video/mp4",
    // })
    // Pipeline.headers({
    //     "Content-Range": `bytes ${start}-${end}/${size}`,
    //     "Accept-Ranges": "bytes",
    //     "Content-Length": end - start + 1,
    //     "Content-Type": "video/mp4",
    // });
    // response.code(206);
    // response.type('video/mp4');
    // response.raw.shouldKeepAlive = true;
    Stream.on('close', handlePipelineClose.bind(null, 'Stream CLOSE'));
    Stream.on('error', handlePipelineClose.bind(null, 'Stream ERR'));
    Pipeline.on('close', handlePipelineClose.bind(null, 'Pipe CLOSE'));
    Pipeline.on('error', handlePipelineClose.bind(null, 'Pipe ERR'));
    // Pipeline.socket?.on('close', handlePipelineClose);
    Pipeline.socket?.on('error', (err)=> $Logger.info(err));
    response.raw.on('error', (err)=> $Logger.info(err));
    return Pipeline.socket;

    // return response.send();

    // response.raw.useChunkedEncodingByDefault = true;
    // response.raw.write(Stream)
    // response.raw.writable = true;
    
    // Stream
    //     .on('close', ()=> $Logger.warn('CLOSE'))
    //     .on('finish', ()=> $Logger.warn('FINISH'))
    //     .on('end', ()=> $Logger.warn('END'))
    //     .on('error', (err: any)=>$Logger.warn(err))
    
    
    // const Stream = (
    //     Fs.createReadStream(filename, { start, end, autoClose: true })
    //         .on('data', (data)=>{
    //             // $Logger.info(data);
    //             $Logger.info(typeof data);
    //             response.raw.write(data);
    //             // request.socket.write(data)
    //             // return closeStream();
    //         })
    //         .on('close', ()=> $Logger.warn('CLOSE'))
    //         .on('finish', ()=> $Logger.warn('FINISH'))
    //         .on('end', ()=> $Logger.warn('END'))
    //         .on('error', (err)=>$Logger.warn(err))
    // );
    // response.headers({
    //     "Content-Range": `bytes ${start}-${end}/${size}`,
    //     "Accept-Ranges": "bytes",
    //     "Content-Length": end - start + 1,
    //     "Content-Type": "video/mp4",
    // });
    // response.code(206);
    // response.type('video/mp4');
    // return Stream
}
export type FastifyStreamReply = typeof _streamImageMedia | typeof _streamVideoMedia;
export const fastifyStream = fp(function(instance, _opts, done) {    
    instance.addHook('onSend', async (request, response, payload: string)=> {
        try {
            const _payload: InferMediaRouteResult<string> = JSON.parse(payload);
            if ((_payload.error || _payload.result == undefined) || typeof _payload.result.data !== 'string') {
                return payload
            }
            switch (request.url.split('?')[0]) {
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
        } catch (err) {
            $Logger.error(err);
            return payload;
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