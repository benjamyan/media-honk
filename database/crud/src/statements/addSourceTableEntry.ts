import * as Mysql from 'mysql2/promise';
import { Honk } from 'mediahonk';

import { Database } from '..';

/** These functions would be a good usecase for generators */
export const addSourceTableEntry = async (source: Omit<Honk.DB.source, 'id'>): Promise<true | Error> => {
    try {
        const newSourceEntry = await (
            Database
                .query<Mysql.RowDataPacket[]>(
                    `INSERT INTO sources SET ?`,
                    source,
                    // { rowsAsArray: true }
                )
                .then(()=> {
                    return true
                })
                .catch((err)=>{
                    console.log(err)
                    return new Error('Unhandled exception')
                })
        );
        // if (remoteSources === undefined || !Array.isArray(remoteSources)) {
        //     throw new Error('Failed to get remote db sources')
        // }
        if (newSourceEntry instanceof Error || !newSourceEntry) {
            throw new Error('Unhandled exception when adding new media source entry')
        }
        return true
        // return [ ...remoteSources ];
    } catch (err) {
        console.error(err)
        return err instanceof Error ? err : new Error(`Unhandled exception`);
    }
}
