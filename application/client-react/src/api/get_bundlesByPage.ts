import axios, { AxiosResponse } from "axios";
import { wrapPromise } from "./_utils";
import { ENDPOINTS, QUERY_PARAMS } from "../config/honk.endpoints";

export const get_bundlesByPage = async (pageNumber?: number)=> {
    const queryEndpoint = `${ENDPOINTS.local.getBundles}?${QUERY_PARAMS.getBundles.page}=${pageNumber || 1}`
    const abortController = new AbortController();
    
    const initialConnection = (
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
                return res.data;
            })
            .catch((err: any)=> {
                console.error(err)
                abortController.abort()
                return err
            })
    );

    return initialConnection
}