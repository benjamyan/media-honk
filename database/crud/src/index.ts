import * as Mysql from 'mysql2/promise';
import { default as Express } from 'express';
import { Honk } from 'mediahonk';

import { parseLocalConfigFile } from './routines/parseLocalConfig';
import { persistMissingSources } from './routines/persistMissingSources';
// import { getMediaEntries } from './routines/getMediaEntries';
import { buildMediaEntries } from './routines/buildMediaEntries';

const Server = Express();
export const Kill = (msg?: string | Error)=> {
    if (msg !== undefined) {
        console.error(msg)
    }
    process.exit(1);
}
export const MediaDB: Honk.DB.Schema = {
    artist: [],
    category: [],
    media: [],
    source: [],
    media_relation: []
};
export let LocalConfig!: Honk.Configuration;
export let Database!: Mysql.Connection;

// type MediaTypeProcessingFlag = ('IMAGE' | 'AUDIO' | 'VIDEO')[] | null;

Server.listen(3000, async ()=> {
    console.log('Server started on 3000');
    try {
        const parseConfig = await parseLocalConfigFile();
        
        if (parseConfig instanceof Error) {
            throw new Error('Exception occured when reading contents of config.yaml')
        }
        LocalConfig = { ...parseConfig };

        const { mysql } = LocalConfig;
        Database = await Mysql.createConnection({
            host: mysql.host,
            port: mysql.port,
            user: mysql.username,
            password: mysql.password,
            database: mysql.db_name,
            insecureAuth: mysql.allow_insecure
        });
        
        const args = process.argv.slice(2, process.argv.length);
        
        if (args.includes('source')) {
            console.log("Running `source`");
            const remoteSources = await persistMissingSources();
            if (Array.isArray(remoteSources)) {
                MediaDB.source = [ ...remoteSources ];
            } else if (remoteSources instanceof Error) {
                throw remoteSources
            } else {
                throw new Error(`Unhandled exception when building remote sources`)
            }
        }
        if (args.includes('media')) {
            console.log("Running `media`")
            await buildMediaEntries();
            
        }
        if (args.includes('backup')) {
            console.log("Running `backup`")

        }
    } catch (err) {
        console.log(err)
        if (err instanceof Error) {
            Kill(err)
        } else {
            Kill('Unhandled exception in server')
        }
    } finally {
        process.exit(0);
    }
})

export default {}

/* 

*/
