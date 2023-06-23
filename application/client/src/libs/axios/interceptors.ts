import Axios from "axios";
import { HONK_URL } from "../../config/honk.endpoints";

export function setupAxiousInterceptors() {
    console.log(`Url: ${HONK_URL[Client.honkConfig.ENV]}`)
    Axios.interceptors.request.use(request => {
        if (request.url && request.url.startsWith('/')) {
            request.url = `${HONK_URL[Client.honkConfig.ENV]}${request.url}`;
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
