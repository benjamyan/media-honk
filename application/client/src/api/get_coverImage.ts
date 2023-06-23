import axios, { AxiosResponse } from "axios";
import { wrapPromise } from "./_utils";
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from "../config/honk.endpoints";

export const get_coverImage = (bundleId: string)=> {
    const query = `${ENDPOINTS.getCoverImage}?${QUERY_PARAMS.getBundles.id}=${bundleId}`;

    return {
        static: HONK_URL[Client.honkConfig.ENV] + query,
        axios: async ()=> {
            const abortController = new AbortController();
            let coverImage: string | undefined = undefined;
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
                    coverImage = res.data;
                })
                .catch((err: any)=> {
                    console.error(err)
                    abortController.abort()
                });
        
            return coverImage
        }
    }
}
