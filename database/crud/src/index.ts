import * as Mysql from 'mysql2/promise';
import { default as Express } from 'express';
import { Honk } from 'mediahonk';

import { parseLocalConfigFile } from './routines/parseLocalConfig';
import { persistMissingSources } from './routines/persistMissingSources';
import { getMediaEntries } from './routines/getMediaEntries';

const Server = Express();
export const Kill = (msg?: string | Error)=> {
    if (msg !== undefined) {
        console.error(msg)
    }
    process.exit(1);
}
export const MediaDB = {
    artist: [],
    category: [],
    media: [],
    source: [],
    media_relation: []
};
export let LocalConfig!: Honk.Configuration;
export let Database!: Mysql.Connection;


Server.listen(3000, async ()=> {
    console.log('server started');
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
        
        await persistMissingSources();

    } catch (err) {
        console.log(err)
        if (err instanceof Error) {
            Kill(err)
        } else {
            Kill('Unhandled exception in server')
        }
    }
})

export default {}

/* 

*/
