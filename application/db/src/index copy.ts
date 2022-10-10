import * as mysql from 'mysql';

// const connection = mysql.createConnection('http://localhost:8080/?server=db&username=admin&db=medialan&script=db')
// const connection = mysql.createConnection('http://localhost:8080/?server=db&username=admin&db=medialan');
const connection = mysql.createConnection({
    host: 'localhost',
    port: 8080,
    user: 'admin',
    password: 'admin',
    database: 'medialan'
});

connection.connect()
// connection.beginTransaction(function(err){
//     connection.query(
//         'INSERT INTO media (title, asset_length, media_source) VALUES (`test`, `994834`, `13`)', 
//         function(err) {
//             if (err) {
//                 console.error(err);
//                 return;
//             }
//             console.log('success');
//         }
//     );
// })

console.log(0)
connection.beginTransaction(function (err) {
    console.log(1)
    if (err) { throw err; }
    console.log(2)
    connection.query(
        'INSERT INTO media (title, asset_length, media_source) VALUES (`test`, `994834`, `13`)', 
        function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    throw error;
                });
            }

            var log = 'Post ' + results.insertId + ' added';

            connection.query(
                'INSERT INTO media (title, asset_length, media_source) VALUES (`test`, `994834`, `13`)', 
                log, 
                function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            throw error;
                        });
                    }
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        console.log('success!');
                    });
                }
            );
        }
    );
});

console.log(999)
// connection.end();

export default {}
