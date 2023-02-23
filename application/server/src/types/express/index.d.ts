import express from 'express';
// https://stackoverflow.com/questions/43952198/how-to-override-or-extend-a-libary-type-definition-in-typescript
declare module 'express' {
    interface Request {
        query: {
            /** Meta type to be queries against; relative to the `meta` table in model */
            metatype?: 'artists' | 'categories';
            /** A specific file to be fetched from the server */
            file?: string;
            /** The `_guid` field to be requested for a fetch/query/insert */
            guid?: string;
        }
    }
    // interface Locals extends Honk.Configuration { };
}
