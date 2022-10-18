import * as Mysql from 'mysql2/promise';
import { default as Express } from 'express';

import { getMediaEntries } from './routines/getMediaEntries'

const Server = Express()

Server.listen(3000, async ()=> {
    console.log('server started')
    try {
        const mysqlconnection = Mysql.createConnection({
            host: '172.21.0.2',
            port: 3306,
            user: 'admin',
            password: 'admin',
            database: 'medialan',
            insecureAuth: true
        });
        const db = (await mysqlconnection);
        const media = await getMediaEntries();

        console.log(media)

        await db.connect();
        
        await db.query(`SELECT * FROM media`)
            .then((res)=> {
                console.log(res[0])
            })
            .catch((err)=> {
                console.log(err)
            });
            
    } catch (err) {
        console.log(err)
    }
})

export default {}
