import { Response, Request } from 'express';
import { default as SSDP } from 'node-ssdp';
import { default as Parser, toJson } from 'xml2json';
import { default as Axios } from 'axios';
import { RemoteInfo } from 'node:dgram';

const getDeviceInfo = async (headers: SSDP.SsdpHeaders, _statusCode: number, rinfo: RemoteInfo)=> {
    try {
        if (headers.LOCATION === undefined 
            || !headers.LOCATION.split('://')[1].startsWith(rinfo.address)
        ) {
            throw new Error('Invalid headers')
        }
        const docs = await (
            Axios(headers.LOCATION, {
                method: 'GET',
                headers: {
                    "Accept": "application/xhtml+xml; application/xml;q=0.9"
                }
            })
                .then(res=>{
                    return Parser.toJson(res.data)
                })
                .catch(err=> console.log(err))
        );
        console.log(docs)
    } catch (err) {
        console.log(err)
    }
}

export function getCastingDevices(req: Request, res: Response) {
    try {
        const ClientSSDP = new SSDP.Client();
        const foundDevices: any[] = [];
        
        ClientSSDP.on('response', async (headers: SSDP.SsdpHeaders, _statusCode: number, rinfo: RemoteInfo)=> {
            try {
                if (headers.LOCATION === undefined 
                    || !headers.LOCATION.split('://')[1].startsWith(rinfo.address)
                ) {
                    throw new Error('Invalid headers')
                }
                await Axios(headers.LOCATION, {
                    method: 'GET',
                    headers: {
                        "Accept": "application/xhtml+xml; application/xml;q=0.9"
                    }
                })
                    .then((res)=>{
                        const parsedRes = Parser.toJson(res.data);
                        foundDevices.push({

                        })
                    })
                    .catch(err=> console.log(err));
            } catch (err) {
                console.log(err)
            }
        })
        ClientSSDP.search('ssdp:all');

        setTimeout(function() {
            ClientSSDP.stop();
            if (foundDevices.length > 0) {
                res.statusCode = 200;
                res.set({
                    "Content-Type": "application/json"
                })
                res.json(foundDevices)
            } else {
                res.sendStatus(203)
            }
        }, 5000)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}
