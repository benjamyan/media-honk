import { AxiosResponse } from "axios";

export const awaitTimeout = (timeout: number) =>
    new Promise((resolve, reject) =>
        setTimeout(
            () => (status === undefined ? resolve(true) : reject(false)),
            timeout
        )
    );

export const wrapPromise: any | boolean = (promise: AxiosResponse<any>, timeout: number) => (
    Promise.race([promise, awaitTimeout(timeout)])
);