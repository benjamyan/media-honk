import Axios from "axios";

export function setAxiosGlobalDefaults() {
    Axios.defaults.headers.common['Accept'] = 'text/html;application/json;';
    Axios.defaults.headers.common['Accept-Language'] = 'en-US,en;q=0.5';
    Axios.defaults.headers.common['Content-Language'] = 'en-US,en;q=0.5';
    Axios.defaults.headers.common['Content-Type'] = 'nosniff';
}
