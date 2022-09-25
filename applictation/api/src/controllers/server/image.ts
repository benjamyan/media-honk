import { default as Fs } from 'node:fs'
import { default as Path } from 'node:path';
import { Response } from 'express';

import { Honk } from '../../types'

export async function getImage(req: Honk.Request, res: Honk.Response) {
    try {
        if (!!req.query.file && req.query.file !== undefined) {

            // TODO sanitize the input
            const imagePath: string = Path.resolve('', req.query.file);
            if (Fs.existsSync(imagePath)) {
                // const fileStream = Fs.createReadStream(imagePath);
                res.status(200)
                res.set({
                    "Access-Control-Allow-Origin": "http://192.168.0.11",
                    "Content-Type": "image/jpeg" 
                })
                res.sendFile(imagePath)
                // fileStream.pipe(res);
                // fileStream.on('open', ()=> {
                //     console.log('open')
                // })
                // fileStream.on('error', ()=> {
                //     console.log('err')
                // })
                // fileStream.on('close', ()=> {
                //     console.log('closed')
                // })
                return
            } else {
                console.log('image not found')
                res.sendStatus(404)
            }
        } else {
            res.sendStatus(400)
            // res.statusCode = 400;
            // res.send("Missing parameter")
        }
    } catch (err) {
        console.log(`File: ${req.query.file}`)
        console.log(err)
        res.sendStatus(500)
    }
}
