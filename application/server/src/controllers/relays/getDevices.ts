import { default as Chromecast } from 'chromecast-api';
import Device from 'chromecast-api/lib/device';

import { Serve } from '../../types'

export function getCastingDevices(req: Serve.Request, res: Serve.Response) {
    try {
        const ClientSSDP = new Chromecast();
        const foundDevices: Device[] = [];

        ClientSSDP.on('device', (device: Device)=> {
            if (!foundDevices.some((found: Device)=> found.name === device.name)) {
                foundDevices.push(device)
            }
        })

        
        setTimeout(function() {
            if (foundDevices.length > 0) {
                res.statusCode = 200;
                res.set({
                    "Content-Type": "application/json"
                })
                res.json(foundDevices)
            } else {
                res.sendStatus(203)
            }
        }, 1000)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}
