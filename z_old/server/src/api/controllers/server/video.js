// const CONFIG = require('../../../hidden_configs');
const fs = require('fs')
const path = require('path');
const cp = require("child_process");
const { replace } = require('lodash');

const buff = Buffer.alloc(100);
const header = Buffer.from("mvhd");

async function getVideoLength(videoUrl) {
    const file = await fs.promises.open(videoUrl, "r");
    const { buffer } = await file.read(buff, 0, 100, 0);
    // const bufferSize = await fs.promises.readFile(videoUrl)
    await file.close();

    const start = buffer.indexOf(header) + 17;
    const timeScale = buffer.readUInt32BE(start);
    const duration = buffer.readUInt32BE(start + 4);

    //  const audioLength = Math.floor((duration / timeScale) * 1000) / 1000;

    return {
        buffer: buffer,
        length: Math.floor((duration / timeScale) * 1000)
    }
}

module.exports = async function (context) {
    console.log(context.query.file)
    try {
        // cp.spawn("ffmpeg", [
        //     "-f",
        //     "lavfi",
        //     "-i",
        //     // "anullsrc",
        //     // "-i",
        //     context.query.file,
        //     // "-",
        //     "-c:v",
        //     "libx264",
        //     "-preset",
        //     "veryfast",
        //     "-tune",
        //     "zerolatency",
        //     "-c:a",
        //     "aac",
        //     "-ar",
        //     "44100",
        //     // "-f",
        //     "flv",
        //     // "http://localhost:8081/live/example1"
        //     `rtmp://localhost/live/example1`
        // ]) 
        const streamName = context.query.file.split('/');
        // console.log(streamName)
        const sn2 = streamName[streamName.length - 1].replace('.mp4', '')
        // console.log(sn2)
        // getVideoLength(context.query.file)
        const streamLength = await getVideoLength(context.query.file)

        // cp.exec(`ffmpeg -re -i ${context.query.file} -c copy -f flv rtmp://localhost/live/${sn2}`)
        // cp.exec(`ffmpeg -re -i ${context.query.file} -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -ar 44100 -f flv rtmp://localhost/live/${sn2}`)
        // cp.exec(`ffmpeg -re -i ${context.query.file} -profile:v baseline -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls rtmp://localhost/live/${sn2}.m3u8`)

        context.res.writeHead(200, {'Content-Type': 'video/mp4'});
        let readStream = fs.createReadStream(context.query.file);
        readStream.pipe(context.res);

        // context.res.send(JSON.stringify({
        //     url: `ws://localhost/live/${sn2}.flv`,
        //     length: streamLength.length,
        //     buffer: streamLength.buffer
        // }))
    } catch (err) {
        console.log(err)
        context.res.sendStatus(400)
    }
    // const imagePath = path.join('', context.query.file);
    // const fileStream = fs.createReadStream(imagePath);
    // context.res.writeHead(200, {"Content-Type": "image/jpeg"});
    // fileStream.pipe(context.res);
}
// module.exports = serverPoke