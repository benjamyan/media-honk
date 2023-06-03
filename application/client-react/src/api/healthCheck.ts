import { wrapPromise } from "./_utils";
import axios, { AxiosError } from "axios";

export const get_healthCheck = async (): Promise<boolean | AxiosError> => {
    const abortController = new AbortController();
    
    const initialConnection = (
        await wrapPromise(
            axios('/health', {
                method: 'GET',
                signal: abortController.signal
            }), 
            5000, 
            false
        )
            .then((res: Response | boolean)=> {
                if (typeof(res) === 'boolean') {
                    throw new Error('Promise failed with timeout')
                } else if (res.status !== 200) {
                    throw new Error('Failed request with status of ' + res.status)
                }
                return true
            })
            .catch((err: any)=> {
                console.error(err)
                abortController.abort()
                return err
            })
    );

    return initialConnection
}