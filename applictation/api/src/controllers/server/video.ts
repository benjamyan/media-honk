import * as Fs from 'node:fs';
import * as Path from 'node:path';
import { Response } from 'express';
const buff = Buffer.alloc(100);
const header = Buffer.from("mvhd");

import { Honk } from "../../types";

export async function getVideoFilePipe(req: Honk.Request, res: Honk.Response) {
    try {
        console.log(req.headers.origin)
        if (!!req.query.file) {
            const videoPath = Path.join('', req.query.file);
            const getVideoBuffer = async ()=> {
                const file = await Fs.promises.open(videoPath, "r");
                const { buffer } = await file.read(buff, 0, 100, 0);
            
                await file.close();
            
                const start = buffer.indexOf(header) + 17;
                const timeScale = buffer.readUInt32BE(start);
                const duration = buffer.readUInt32BE(start + 4);
            
                return duration
            }
            const videoBuffer = await getVideoBuffer()
            // res.writeHead(
            //     206, 
            //     {
            //         'access-control-allow-origin': 'http://localhost:8081',
            //         'Content-Type': 'video/mp4; application/x-mpegURL',
            //         'Accept-Ranges': 'bytes',
            //         'Content-Length': videoBuffer
            //     }
            // );
            res.statusCode = 206;
            res.set({
                'access-control-allow-origin': 'http://192.168.0.11',
                'Content-Type': 'video/mp4; application/x-mpegURL',
                'Accept-Ranges': 'bytes',
                'Content-Length': videoBuffer
            })
            res.sendFile(videoPath)
            res.on('error', (err)=> {
                // console.log(err)
                res.end()
            })
            res.on('pipe', ()=> {
                // console.log('pipe')
            })
            res.on('close', ()=> {
                // console.log('close')
                res.end()
            })
            res.on('unpipe', ()=> {
                // console.log('unpipe')
                res.end()
            })
            res.on('drain', ()=> {
                // console.log('drain')
            })
            res.on('finish', ()=> {
                // console.log('finish')
            })
            
            // let readStream = Fs.createReadStream(videoPath),
            //     streamOpen: boolean = false;
            // readStream.pipe(res);
            
            // readStream.on('pause', ({...props}: any)=> {
            //     console.log(props)
            //     // store the current position to the database
            // })
            // readStream.on('data', ({...props}: any)=> {
            //     console.log(props)
            // })
        } else {
            res.statusCode = 400
            res.send('Missing "file" field')
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}
