import * as Https from 'node:https';
import * as Fs from 'node:fs';
import * as Path from 'node:path';

import App from './app';

const server = Https.createServer({
    key: Fs.readFileSync(Path.resolve(__dirname, '../cert/192.168.0.11-key.pem')/*`${__dirname}/localhost-key.pem`*/, 'utf8'),
    cert: Fs.readFileSync(Path.resolve(__dirname, '../cert/192.168.0.11.pem')/*`${__dirname}/localhost.pem`*/, 'utf8')
    // key: Fs.readFileSync(`${__dirname}/localhost-key.pem`, 'utf8'),
    // cert: Fs.readFileSync(`${__dirname}/localhost.pem`, 'utf8')
}, App).listen(82);
server.on('connect', ()=>{
    console.log('connect')
})
server.on('connection', ()=>{
    console.log('connection')
})

App.listen(81, '192.168.0.11', (): void => {
    console.log(`server is listening`)
})
