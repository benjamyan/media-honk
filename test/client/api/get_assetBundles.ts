import axios, { AxiosResponse } from "axios";
import { wrapPromise } from "./_utils";
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from "./_endpoints";

type GetAssetBundlesOptions = {
    [ Key in keyof typeof QUERY_PARAMS.getBundles ]?: (
        Key extends 'limit' | 'page' 
            ? number 
        : Key extends 'type'
            ? Honk.Media.StoredMediaTypes
        : Key extends 'artist' | 'category'
            ? Array<string>
        : string
    );
}

export const get_assetBundles = (options: GetAssetBundlesOptions = {})=> {
    let query = ENDPOINTS.getBundles;
    for (const option in options) {
        if (query.indexOf('?') == -1) query = query + '?';
        if (!query.endsWith('?')) query = query + '&';
        query = query + `${QUERY_PARAMS.getBundles[option as keyof typeof QUERY_PARAMS.getBundles]}=${options[option as keyof GetAssetBundlesOptions]}`;
    }

    // if (mediaId !== null) {
    //     query = query + `&${QUERY_PARAMS.streamVideo.entry}=${mediaId}`;
    // }

    return {
        static: HONK_URL[Client.honkConfig.ENV] + query,
        axios: async ()=> {
            const abortController = new AbortController();
            let bundles: Honk.Media.AssetBundle[] | Error = [];
            await wrapPromise(
                axios(query, {
                    method: 'GET',
                    signal: abortController.signal
                }),
                5000,
                false
            )
                .then((res: AxiosResponse)=> {
                    if (res.status !== 200) {
                        throw new Error(`Unhandled expcetion of returned endpoint call.`);
                    }
                    if (!Array.isArray(res.data)) {
                        throw new Error('Bad response format')
                    }
                    bundles = res.data;
                })
                .catch((err: any)=> {
                    console.error(err);
                    bundles = err;
                    // abortController.abort();
                });
        
            return bundles
        }
    }
}
