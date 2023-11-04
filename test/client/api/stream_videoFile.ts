import axios, { AxiosResponse } from "axios";
import { wrapPromise } from "./_utils";
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from "./_endpoints";

export const stream_videoFile = (bundleId: string, mediaId: number | null)=> {
    let query = `${ENDPOINTS.streamVideo}?input=${encodeURIComponent(JSON.stringify({
        [QUERY_PARAMS.streamVideo.id]: bundleId,
        [QUERY_PARAMS.streamVideo.entry]: mediaId || undefined
    }))}`;

    // if (mediaId !== null) {
    //     query = query + `&${QUERY_PARAMS.streamVideo.entry}=${mediaId}`;
    // }

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
