import { wrapPromise } from "./utils";
import { MediaLibraryEntry } from "../types";
import axios, { AxiosResponse } from "axios";

export const get_libraryContents = async (): Promise<MediaLibraryEntry[]> => {
    const abortController = new AbortController();
    
    const libraryRequest = (
        await wrapPromise(
            axios('/server/library', {
                method: 'GET',
                signal: abortController.signal
            }), 
            5000, 
            false
        )
            .then((res: AxiosResponse<string> | boolean)=> {
                if (typeof(res) === 'boolean') {
                    throw new Error('Promise failed with timeout')
                } else if (res.status !== 200) {
                    throw new Error('Failed request with status of ' + res.status)
                }
                return res.data
            })
            .then((json: MediaLibraryEntry[])=>{
                return json
            })
            .catch((err: any)=> {
                console.error(err)
                abortController.abort()
                return false
            })
    );

    return libraryRequest
}