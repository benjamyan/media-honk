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
                const todayDate = new Date()
                const expireDate = new Date(new Date(todayDate).setDate(todayDate.getDate() + 1)).toUTCString();
                res.status(200)
                res.set({
                    "Access-Control-Allow-Origin": "http://192.168.0.11",
                    "Content-Type": "image/jpeg",
                    "Cache-Control": "max-age",
                    // "Cache-Control": "private, max-age=3600000",
                    // "Expires": JSON.stringify(expireDate)
                })
                res.sendFile(imagePath)
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
