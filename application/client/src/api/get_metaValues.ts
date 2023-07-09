import axios, { AxiosResponse } from "axios";
import { wrapPromise } from "./_utils";
import { ENDPOINTS, QUERY_PARAMS } from "./_endpoints";

export const get_metaValues = async (pageNumber?: number)=> {
    const queryEndpoint = `${ENDPOINTS.getMeta}`;
    const abortController = new AbortController();
    let metaValues: Record<'category_name' | 'artist_name', Array<string>> = {
        category_name: [],
        artist_name: []
    };
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
            if (res.data.artist_name) {
                metaValues.artist_name = res.data.artist_name;
            }
            if (res.data.category_name) {
                metaValues.category_name = res.data.category_name;
            }
            // metaValues = res.data;
            // return res.data as Honk.Media.AssetBundle[];
        })
        .catch((err: any)=> {
            console.error(err)
            abortController.abort()
        })

    return metaValues
}