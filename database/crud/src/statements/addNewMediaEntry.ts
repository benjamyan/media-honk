import * as Mysql from 'mysql2/promise';
import { Honk } from 'mediahonk';

import { Database } from '..';
import { PathLike } from 'node:fs';

// CREATE PROCEDURE complete_entry_from_data 
// (
//     IN sourceUrl TEXT,
//     IN relativeUrl TEXT,
//     IN mainTitle TEXT,
//     IN subTitle TEXT,
//     IN coverImageUri TEXT,
//     IN totalEntries JSON,
//     IN mediaCategories TEXT,
//     IN mediaArtists TEXT
// )

/** These functions would be a good usecase for generators */
export const addNewMediaEntry = async (data: Honk.Media.BasicLibraryEntry): Promise<Honk.DB.source[] | Error> => {
    try {

        console.log(data)

        const { entries, categories, artists } = data;
        if (entries.length === 0) {
            throw new Error('Media entries cannot be empty')
        }

        const remoteSources = await (
            Database
                .query(
                    `CALL complete_entry_from_data(?,?,?,?,?,?,?,?)`,
                    [
                        data.sourceUrl,
                        data.relativeUrl,
                        data.title,
                        data.subtitle,
                        data.coverImageUri,
                        JSON.stringify(entries),
                        !!categories && categories.length === 0 ? null : Database.escape(categories),
                        !!artists && artists.length === 0 ? null : Database.escape(artists)
                           
                    ]
                    // { rowsAsArray: true }
                )
                .then(res=> {
                    console.log(res)
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
