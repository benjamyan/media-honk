import { Dirent } from "fs";
import Fs from 'node:fs';
import Path from 'node:path';

// const reUpper = /([A-Z])/g;
// checks for nonsense left over in the title like names, addresses, etc.
// const reSuperfluous = /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|((\s|\.)?([a-z]+)scr|rip|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi;
const reGlyphs = /(?!([a-z\d]))./gi; // /(?!([a-z\d\s]))./gi;
const reTrailing = /((\_+)$|(\s+)$)/gim;
const reSpacers = /([\_]{2,})/gim;

const includeName: string[] = [];
const excludeName: string[] = [];

const excludeExtensions: string[] = ['txt', 'nfo','DS_Store','ini'];
const audioExtensions: string[] = ['mp3'];
const imageExtensions: string[] = ['jpg','png','jpeg','bmp'];
const videoExtensions: string[] = ['mov','avi','mp4'];

const handleDirectory = async (dirent: Dirent): Promise<void> => {
    const dirName = dirent.name;
    let newName: string = dirent.name.replace(/\s/gi, '_').toLowerCase();
    if (newName.match(reGlyphs)) {
        newName = newName.replace(reGlyphs, '_');
    }
    if (newName.match(reTrailing)) {
        newName = newName.replace(reTrailing, '');
    }
    if (newName.match(reSpacers)) {
        newName = newName.replace(reSpacers, '_');
    }
    if (newName !== dirName) {
        console.log("Directory: " + newName);
        await Fs.promises.rename(`${__dirname}/${dirName}`, `${__dirname}/${newName}`)
    }
    return
};
const handleSingleFile = ()=> {

}
const handleFiles = async (directory: string, files: Dirent[]): Promise<void> => {
    let newName: string;

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
                if (newName !== file.name) {
                    console.log(newName)
                    await Fs.promises.rename(`${directory}/${file.name}`, `${directory}/${newName}`)
                }
            }
        }
    })
}

const readThenHandleDirContent = async (): Promise<void>=> {
    const directories: Dirent[] = await Fs.promises.readdir(
        __dirname, { withFileTypes: true }
    );
    for (const dirent of directories) {
        if (dirent.isDirectory()) {
            await handleDirectory(dirent);
        } else {

        }
    }
    return
}

(async function() {
    console.log("\n-----------------\nSTART------------\n-----------------\n");

    // const directories: Dirent[] = await Fs.promises.readdir(
    //     __dirname, { withFileTypes: true }
    // );
    // for (const dirent of directories) {
    //     if (dirent.isDirectory()) {
    //         await renameDirectory(dirent);
    //     } else {

    //     }
    // }
    
    console.log("\n---------------\nEND------------\n---------------\n");
})()

// glyphs
// /(?!([a-z\d\s]))./gi || /(?!([a-z1234567890\s]))./gi

// uppercase
// /([A-Z])/g

// pattern match for end of words
// /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|(((\s|\.)([a-z]+)rip)|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi