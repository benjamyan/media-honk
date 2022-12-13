import { wrapPromise } from "./utils"
import axios, { Axios, AxiosResponse } from "axios";

import { CastingDevice } from '../types'

export const get_castingDevices = async (): Promise<CastingDevice[] | false> => {
    const abortController = new AbortController();
    
    const initialConnection = (
        await wrapPromise(
            axios('/relay/devices', {
                method: 'GET',
                headers: {
                    'Accept': 'text/html; application/json;',
                    // 'Origin': 'http://192.168.0.11'
                },
                signal: abortController.signal
            }), 
            5000, 
            false
        )
            .then((res: AxiosResponse | boolean)=> {
                if (typeof(res) === 'boolean') {
                    throw new Error('Promise failed with timeout')
                } else if (res.status !== 200) {
                    throw new Error('Failed request with status of ' + res.status)
                }
                return res.data
            })
            .catch((err: any)=> {
                console.error(err)
                abortController.abort()
                return false
            })
    );

    return initialConnection
}