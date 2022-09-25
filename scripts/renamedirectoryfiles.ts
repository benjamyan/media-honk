import { Dirent } from "fs";
import Fs from 'node:fs';
import Path from 'node:path';

// const reWhitespace = 
const reGlyphs = /(?!([a-z\d\.]))./gi;// /(?!([a-z\d\s]))./gi;
// const reUpper = /([A-Z])/g;
// checks for nonsense left over in the title like names, addresses, etc.
// const reSuperfluous = /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|((\s|\.)?([a-z]+)scr|rip|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi;
const reTrailing = /((\_+)$|(\s+)$)/gim;
const reSpacers = /([\_]{2,})/gim;

(async function() {
    console.log("\n-----------------\nSTART------------\n-----------------\n");

    const directories: Dirent[] = await Fs.promises.readdir(
        __dirname, { withFileTypes: true }
    );
    // const getFiles = async (path): Promise<Dirent[]>=> await Fs.promises.readdir(
    //     path, { withFileTypes: true }
    // );
    let directory: string,
        dirFiles: Dirent[],
        fileName: string[],
        newName: string;
    for (const dirent of directories) {
        if (dirent.isDirectory()) {

            // dirName = dirent.name;
            directory = Path.join(__dirname, dirent.name) //`${__dirname}/${dirent.name}`

            await Fs.promises
                .readdir(
                    directory, 
                    { withFileTypes: true }
                )
                .then((files)=>{
                    // console.log(files)
                    files.forEach( async (file)=> {
                        if (
                            file.name === '.DS_Store'
                            || file.name.startsWith('._')
                            || file.name.endsWith('.txt')
                            || file.name.endsWith('.nfo')
                            || file.name === 'WWW.YIFY-TORRENTS.COM.jpg'
                            && (
                                !file.name.endsWith('.mp4') 
                                || !file.name.endsWith('.mov') 
                                || !file.name.endsWith('.aac') 
                                || !file.name.endsWith('.avi')
                                || !file.name.endsWith('.srt') 
                            )
                        ) {
                            Fs.promises.unlink(`${directory}/${file.name}`)
                        } else {
                            if (!file.isDirectory()) {
                                // fileName = file.name.split('.');
                                // const fileExt = Path.extname(`${directory}/${file.name}`)
                                // console.log(fileExt)
                                console.log(file.name)
                                newName = file.name.replace(/\s/gi, '_').toLowerCase();
                                if (newName.match(reGlyphs)) {
                                    newName = newName.replace(reGlyphs, '_');
                                }
                                if (newName.match(reTrailing)) {
                                    newName = newName.replace(reTrailing, '');
                                }
                                if (newName.match(reSpacers)) {
                                    newName = newName.replace(reSpacers, '_');
                                }
                                console.log(newName)
                                await Fs.promises.rename(`${directory}/${file.name}`, `${directory}/${newName}`)
                            }
                            
                        }

                        // newName = file.name.rdeplace(/\s/gi, '_').toLowerCase();
                        // if (newName.match(reGlyphs)) {
                        //     newName = newName.replace(reGlyphs, '_');
                        // }
                        // if (newName.match(reTrailing)) {
                        //     newName = newName.replace(reTrailing, '');
                        // }
                        // if (newName.match(reSpacers)) {
                        //     newName = newName.replace(reSpacers, '_');
                        // }
                        // console.log(newName)
                        // await Fs.promises.rename(`${__dirname}/${dirName}`, `${__dirname}/${newName}`)
                    })
                })
                .catch((err)=>{
                    console.log(err)
                });
                // break;
            // dirFiles = await getFiles(`${__dirname}/${dirent.name}`).then(files=> files).catch(err=> console.log(err));

            // newName = dirent.name.replace(/\s/gi, '_').toLowerCase();
            // if (newName.match(reGlyphs)) {
            //     newName = newName.replace(reGlyphs, '_');
            // }
            // if (newName.match(reTrailing)) {
            //     newName = newName.replace(reTrailing, '');
            // }
            // if (newName.match(reSpacers)) {
            //     newName = newName.replace(reSpacers, '_');
            // }
            // console.log(newName)
            // await Fs.promises.rename(`${__dirname}/${dirName}`, `${__dirname}/${newName}`)
        }
    }
    
    console.log("\n---------------\nEND------------\n---------------\n");
})()

// glyphs
// /(?!([a-z\d\s]))./gi || /(?!([a-z1234567890\s]))./gi

// uppercase
// /([A-Z])/g

// pattern match for end of words
// /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|(((\s|\.)([a-z]+)rip)|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi