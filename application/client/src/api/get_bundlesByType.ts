import axios, { AxiosResponse } from "axios";
import { wrapPromise } from "./_utils";
import { ENDPOINTS, QUERY_PARAMS } from "../config/honk.endpoints";

export const get_bundlesByMediaType = async (mediaType: Honk.Media.StoredMediaTypes)=> {
    const queryEndpoint = `${ENDPOINTS.getBundles}?${QUERY_PARAMS.getBundles.type}=${mediaType}`
    const abortController = new AbortController();
    let bundlesByPage: Honk.Media.AssetBundle[] = [];
    await wrapPromise(
        axios(queryEndpoint, {
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
            bundlesByPage = res.data;
            // return res.data as Honk.Media.AssetBundle[];
        })
        .catch((err: any)=> {
            console.error(err)
            abortController.abort()
        })

    return bundlesByPage
}