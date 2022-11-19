// import { Http2ServerResponse } from "http2";
import { AxiosResponse } from "axios";

export const awaitTimeout = (timeout: number) =>
    new Promise((resolve, reject) =>
        setTimeout(
            () => (status === undefined ? resolve(true) : reject(false)),
            timeout
        )
    );

export const wrapPromise: any | boolean = (promise: AxiosResponse<any>, timeout: number) => (
    Promise.race([promise, awaitTimeout(timeout)])
);

// wrapPromise(fetch('https://cool.api.io/data.json'), 3000, {
//     reason: 'Fetch timeout',
// })
//     .then(data => {
//         console.log(data.message);
//     })
//     .catch(data => console.log(`Failed with reason: ${data.reason}`));
// Will either log the `message` if `fetch` completes in under 3000ms
// or log an error message with the reason 'Fetch timeout' otherwise