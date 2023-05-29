export const cmdLogger = (msg: string, tracing?: boolean)=> {
    if (!!tracing) {
        console.trace(msg);
    } else {
        console.log(`LOG: ${msg}`);
    }
}