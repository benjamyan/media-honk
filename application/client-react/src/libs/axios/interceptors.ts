import Axios from "axios";

export function setupAxiousInterceptors() {
    Axios.interceptors.request.use(request => {
        if (request.url && request.url.startsWith('/')) {
            request.url = `http://192.168.0.11:8081${request.url}`
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
