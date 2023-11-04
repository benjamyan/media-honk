import axios, { AxiosResponse } from "axios";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { wrapPromise } from "./_utils";
import { ENDPOINTS, QUERY_PARAMS } from "./_endpoints";

export const get_bundlesByPage = async (pageNumber?: number)=> {
    const queryEndpoint = `${ENDPOINTS.getBundles}?input=${encodeURIComponent(JSON.stringify({
        [QUERY_PARAMS.getBundles.page]: pageNumber || 1
    }))}`
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
            // console.log(res)
            bundlesByPage = res.data.result.data;
            // return res.data as Honk.Media.AssetBundle[];
        })
        .catch((err: any)=> {
            console.error(err)
            abortController.abort()
        })

    return bundlesByPage
}