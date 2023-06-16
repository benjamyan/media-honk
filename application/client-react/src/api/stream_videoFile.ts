import axios, { AxiosResponse } from "axios";
import { wrapPromise } from "./_utils";
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from "../config/honk.endpoints";

export const stream_videoFile = (bundleId: string, mediaId: number | null)=> {
    let query = `${ENDPOINTS.streamVideo}?${QUERY_PARAMS.streamVideo.id}=${bundleId}`;

    if (mediaId !== null) {
        query = query + `&${QUERY_PARAMS.streamVideo.entry}=${mediaId}`;
    }

    return {
        static: HONK_URL[honkConfig.ENV] + query,
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
