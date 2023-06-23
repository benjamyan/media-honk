import axios, { AxiosResponse } from "axios";
import { wrapPromise } from "./_utils";
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from "../config/honk.endpoints";

export const stream_imageFile = (bundleId: string, mediaId: number | null)=> {
    let query = `${ENDPOINTS.streamImage}?${QUERY_PARAMS.streamImage.id}=${bundleId}`;

    if (mediaId !== null) {
        query = query + `&${QUERY_PARAMS.streamImage.entry}=${mediaId}`;
    }

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
