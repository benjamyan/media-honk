import Axios from "axios";
import { HONK_URL } from "../../config/honk.endpoints";

export function setupAxiousInterceptors() {
    Axios.interceptors.request.use(request => {
        if (request.url && request.url.startsWith('/') && process.env.NODE_ENV) {
            /// @ts-expect-error
            request.url = `${HONK_URL[honkConfig.ENV]}${request.url}`
            // if (process.env.NODE_ENV === 'development') {
                
            // } else if (process.env.NODE_ENV === 'staging') {
                
            // } else if (process.env.NODE_ENV === 'production') {
                
            // }
        }
        return request;
    }, error => {
        console.log(error);
        return Promise.reject(error);
    });
}

// Axios.interceptors.response.use(response => {
//     console.log(response);
//     // Edit response config
//     return response;
// }, error => {
//     console.log(error);
//     return Promise.reject(error);
// });
