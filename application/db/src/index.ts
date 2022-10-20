import * as Mysql from 'mysql2/promise';
import { default as Express } from 'express';

import { getMediaEntries } from './routines/getMediaEntries';
import { parseLocalConfigFile } from './routines/parseLocalConfig';
import { Honk } from 'mediahonk';

const Server = Express();
const Kill = (msg?: string | Error)=> {
    if (msg !== undefined) {
        console.error(msg)
    }
    process.exit(1);
}
let LocalConfig!: Honk.Configuration;

const buildMediaEntries = async (): Promise<any> => {
    try {
        const media = await getMediaEntries(LocalConfig);

        // build media sources from list

        // maintain initial entries for persistence
        
        // convert initial entries to sql/db-safe  

        console.log(media)

    } catch (err) {
        console.log(err)
        process.exit(1)
    }
};
const factory_mediaSources = ()=> {
    try {
        const mediaSources = [];

        for (const source in LocalConfig.serve.media_paths) {
            mediaSources.push({
                title: source,
                asset_path: LocalConfig.serve.media_paths[source]
            })
        }

        return mediaSources
    } catch (err) {
        console.log(err)
        Kill('Failed to build media sources')
    }
};
const persistMediaEntries = async ()=> {
    try {
        const { mysql } = LocalConfig;
        const mysqlconnection = Mysql.createConnection({
            host: mysql.host,
            port: mysql.port,
            user: mysql.username,
            password: mysql.password,
            database: mysql.db_name,
            insecureAuth: mysql.allow_insecure
        });
        const db = (await mysqlconnection);
        
        // await db.connect()

        await db.query(`SELECT * FROM media`)
            .then((res)=> {
                console.log(res[0])
            })
            .catch((err)=> {
                console.log(err)
            });
    } catch (err) {
        console.log(err)
        Kill('Unhandled exception when persisting data')
    }
};

Server.listen(3000, async ()=> {
    console.log('server started')
    try {
        
        const parseConfig = await parseLocalConfigFile();
        // console.log(parseConfig)

        if (parseConfig instanceof Error) {
            throw new Error('Exception occured when reading contents of config.yaml')
        } else {
            LocalConfig = { ...parseConfig };

            const { mysql } = LocalConfig;
            const mysqlconnection = Mysql.createConnection({
                host: mysql.host,
                port: mysql.port,
                user: mysql.username,
                password: mysql.password,
                database: mysql.db_name,
                insecureAuth: mysql.allow_insecure
            });
            const db = (await mysqlconnection);
            
            // await db.connect()
    
            await db.query(`SELECT * FROM source`, {
                rowsAsArray: true
            })
                .then((res)=> {
                    const localSources = factory_mediaSources();
                    const responseToParse = Array.from(res)[0];
                    console.log(res[0])
                    console.log(localSources)
                    if (Array.isArray(localSources) && Array.isArray(responseToParse)) {
                        // let currentIndex = -1;
                        // for (const source of responseToParse) {
                        //     console.log(source)
                        //     currentIndex = localSources.findIndex((localSource, index)=>{
                        //         /// @ts-ignore
                        //         if (localSource.title === source.title) {
                        //             return index
                        //         }
                        //         return false
                        //     });

                        // }
                    } else {
                        throw new Error('Could not use respone')
                    }
                })
                .catch((err)=> {
                    console.log(err)
                });
                
        }
        
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
