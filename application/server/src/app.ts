import * as Https from 'node:https';
import * as Fs from 'node:fs';
import * as Path from 'node:path';

import App from './ServerController';

console.log("Stating app...")

if (process.argv.includes('https')) {
    Https.createServer({
        key: Fs.readFileSync(Path.resolve(__dirname, '../cert/192.168.0.11-key.pem'), 'utf8'),
        cert: Fs.readFileSync(Path.resolve(__dirname, '../cert/192.168.0.11.pem'), 'utf8')
    }, App).listen(82, (): void => {
        console.log(`HTTPS listening on https://localhost:82`)
    });
}

App.listen(81, '192.168.0.11', (): void => {
    console.log(`HTTP listening on http://192.168.0.11:81`)
})
