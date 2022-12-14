import * as Mysql from 'mysql2/promise';
import { Honk } from 'mediahonk';

import { Database } from '..';

/** These functions would be a good usecase for generators */
export const aggregateSourceEntries = async (): Promise<Honk.DB.source[] | Error> => {
    try {
        const remoteSources = await (
            Database
                .query<Mysql.RowDataPacket[]>(
                    `SELECT * FROM sources`, 
                    { rowsAsArray: true }
                )
                .then(res=> {
                    return [].slice.call(res[0], 0) as Honk.DB.source[]
                })
                .catch(err=>console.log(err))
        );
        if (remoteSources === undefined || !Array.isArray(remoteSources)) {
            throw new Error('Failed to get remote db sources')
        }
        
        return [ ...remoteSources ];
    } catch (err) {
        console.error(err)
        return err instanceof Error ? err : new Error(`Unhandled exception`);
    }
}
