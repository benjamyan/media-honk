// import { Request, Response } from 'express';
import { promises as Fsp } from 'node:fs';
import * as Path from 'node:path';
import * as Yaml from 'yaml';

import { Honk } from '../../types';

export async function healthStatus(req: Honk.Request, res: Honk.Response) {
    console.log(res.locals)
    res.set({
        'Access-Control-Allow-Origin': 'http://192.168.0.11'
    })
    res.sendStatus(200)
}
