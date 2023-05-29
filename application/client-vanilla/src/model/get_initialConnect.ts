import { wrapPromise } from "./utils"
import axios from "axios";

export const get_initialConnect = async (): Promise<boolean> => {
    const abortController = new AbortController();
    
    const initialConnection = (
        await wrapPromise(
            axios('/server/', {
                method: 'GET',
                headers: {
                    'Accept': 'text/html',
                    // 'Origin': 'http://192.168.0.11'
                },
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
                return false
            })
    );

    return initialConnection
}

// wrapPromise(fetch('https://cool.api.io/data.json'), 3000, {
//   reason: 'Fetch timeout',
// })
//   .then(data => {
//     console.log(data.message);
//   })
//   .catch(data => console.log(`Failed with reason: ${data.reason}`));
  
// Will either log the `message` if `fetch` completes in under 3000ms
// or log an error message with the reason 'Fetch timeout' otherwise
