import Axios from "axios";

export function setAxiosGlobalDefaults() {
    // Axios.defaults.baseURL = 'http://localhost:8081';
    // Axios.defaults.headers.common['Accept-Encoding'] = 'gzip,deflate';
    // Axios.defaults.headers.common['Origin'] = 'http://localhost:8080';
    // Axios.defaults.headers.common['Connection'] = 'keep-alive';
    Axios.defaults.headers.common['Accept'] = 'text/html;application/json;';
    // Axios.defaults.headers.common['Referrer-Policy'] = 'origin';
    Axios.defaults.headers.common['Accept-Language'] = 'en-US,en;q=0.5';
    Axios.defaults.headers.common['Content-Language'] = 'en-US,en;q=0.5';
    Axios.defaults.headers.common['Content-Type'] = 'nosniff';
    // Axios.defaults.headers.get['Content-Type'] = 'text/html,application/json; charset=utf-8';
    // Axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
}
