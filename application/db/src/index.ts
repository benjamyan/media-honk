import * as Mysql from 'mysql';
import * as Util from 'util'
import { default as Express } from 'express';

const Server = Express()
const mysqlconnection = Mysql.createConnection({
    host: 'localhost',
    port: 8080,
    user: 'admin',
    password: 'admin',
    database: 'medialan'
});

const media = [
    {
        "title": "test1",
        "asset_length": 353452,
        "media_source": "13"
    },
    {
        "title": "test2",
        "asset_length": 55555,
        "media_source": "06"
    },
    {
        "title": "test12",
        "asset_length": 121212,
        "media_source": "01"
    }
]



Server.listen(3000, async ()=> {
    console.log('server started')
    const db1 = mysqlconnection;
    const query = Util.promisify(db1.query).bind(db1);
    
    
    (async function connectMySql() {
        console.log(0)
        mysqlconnection.connect(async function (err, client) {
            if (err) {
                console.error('error connecting: ' + err);
                return;
            }
            console.log(1)
            let myquery1 = "SELECT * FROM honkers";
            var newRecords: any = [];
            newRecords = await query(myquery1)
                .catch(err => {
                    console.log(err)
                });
            console.log(newRecords)
        });
    })();

    // connection.connect( (err)=> {
    //     console.log('1')
    //     if (err) {
    //         console.log(err)
    //         return
    //     } else {
    //         console.log('hello sql')
    //         connection.query(
    //             // 'INSERT INTO media (title, asset_length, media_source) VALUES (`test`, `994834`, `13`)', 
    //             'INSERT INTO media VALUES=?', 
    //             media, 
    //             function (error, results, fields) {
    //                 if (error) {
    //                     console.log(error)
    //                     return
    //                     // return connection.rollback(function () {
    //                     //     throw error;
    //                     // });
    //                 }
    //                 console.log('success')
    //                 // connection.commit(function (err) {
    //                 //     if (err) {
    //                 //         return connection.rollback(function () {
    //                 //             throw err;
    //                 //         });
    //                 //     }
    //                 //     console.log('success!');
    //                 // });
    //             }
    //         );
    //     }
    // });

})

export default {}
