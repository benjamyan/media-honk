import { default as Fs, promises as Fsp } from 'fs';
import { default as Path } from 'path';
import { StoredMediaTypes } from '../types/MediaProperties';
import { Constants } from '../config';

/**
 * @function deteremineStoredMediaType A helper function to get the media type from a specified directory based on its content
 * @param dirContent All files within the media directory _including_ extension
 * @returns A string based on {@link StoredMediaTypes} 
 */
export const deteremineStoredMediaType = (dirContent: string[]): StoredMediaTypes => {
    const majorityFileType: Record<string, number> = {};
    let currentFileExt: string;

    /** Reduce the file list, maintiain a counter of the individual files matching a specific extension */
    dirContent.reduce((fileExtCount, file, i, arr)=> {
        currentFileExt = Path.extname(file).replace('.', ''); 
        
        if (Constants.audioExtensions.includes(currentFileExt)) {
            fileExtCount.audio = fileExtCount.audio + 1;
        } else if (Constants.videoExtensions.includes(currentFileExt)) {
            fileExtCount.video = fileExtCount.video + 1;
        } else if (Constants.imageExtensions.includes(currentFileExt)) {
            fileExtCount.image = fileExtCount.image + 1;
        }
        
        if (i == arr.length - 1) {
            const fileCount = fileExtCount.audio + fileExtCount.video + fileExtCount.image;
            /** It is possible that there is a single cover image present, 
             * but can still match the length of a directory containing a single 
             * media or audio file. Test for audio and video _first_
             * */
            for (const extType of Object.entries(fileExtCount)) {
                if (extType[1] >= (fileCount / 3)) {
                    majorityFileType[extType[0]] = extType[1];
                    break;
                }
            }
        }
        return fileExtCount
    }, { video: 0, audio: 0, image: 0 })
    
    switch(Object.keys(majorityFileType)[0]) {
        case 'video': {
            if (majorityFileType.video > 1) {
                return 'VS'
            }
            return 'VU'
        }
        case 'image': {
            if (majorityFileType.image > 1) {
                return 'IS'
            }
            return 'IU'
        }
        case 'audio': {
            if (majorityFileType.audio > 1) {
                return 'AS'
            }
            return 'AU'
        }
        default: {
            return 'X';
        }
    }
    
}

/**
 * @method shakeDirectoryFileTree 
 * @description A generic method to shake a directory structure. Will recursively traverse a directory tree searching for files of a specific extension, or all files in the directory, and append those files to the result. 
 * @param paths
 * - An __absolute__ file path on the system which this service has access to
 * @param fileType
 * - If an array, requires a __minimum__ of one entry.
 * - If undefined, will return a list of all contnet inside a directory, icnluding file extension
 * - An array containing the file with extensions you want to search for. 
 * - Can accept just an extension, or an entire filename _including_ extension
 * @returns An array of absolute file paths matching the given fileType parameter with entries of the following:
 * - An absolute filepath to a specific file 
 * - If an error has occured: A directory appended with an error indiciating something went wrong
 */
export const shakeDirectoryFileTree = async (pathname: string, fileType?: string[]/*[string, ...string[]]*/): Promise<Array<string> | Error> => {
    // console.log('>> shakeDirectoryFileTree()')
    let shakenFiles: string[] = [];

    try {
        if (!Fs.existsSync(pathname)) {
            throw new Error(`FS_ERROR_FAILED_FILEPATH: ${pathname}`)
            // emitter('error', new Error(`FS_ERROR_FAILED_FILEPATH: ${pathname}`))
        } else {
            const shakeResult: string[] | Error = await new Promise(async (resolve, reject)=>{
                let traversalResult: string[] = [],
                    traveralAttempt: Awaited<ReturnType<typeof shakeDirectoryFileTree>> = null!;

                try {
                    const directoryEntries = await Fsp.readdir(pathname, { withFileTypes: true });
                    
                    for await (const entry of directoryEntries) {
                        if (fileType === undefined) {
                            shakenFiles.push(Path.join(pathname, entry.name))
                            continue;
                        }
                        if (entry.isDirectory()) {
                            traveralAttempt = await shakeDirectoryFileTree(Path.join(pathname, entry.name), fileType);
                            if (traveralAttempt instanceof Error) {
                                throw traveralAttempt
                            }
                            traversalResult = traversalResult.concat(traveralAttempt);
                        } else if (entry.isFile()) {
                            if (fileType.some((file)=> entry.name.endsWith(file))) {
                                traversalResult.push(Path.join(pathname, entry.name));
                            }
                        }
                    }
                    resolve(traversalResult)
                } catch (err) {
                    reject(err instanceof Error ? err : new Error(''))
                }
            });
            if (shakeResult instanceof Error) {
                throw new Error(`FS_ERROR_TRAVERSAL_FAILURE: ${pathname}`)
            } else if (shakeResult.length > 0) {
                shakenFiles = shakenFiles.concat(shakeResult)
            }
            return shakenFiles;
        }
    } catch (err) {
        return (
            err instanceof Error
                ? err
                : new Error(`FS_ERROR_UNHANDLED: ${pathname}`)
        );
    }
}

export const naturalCompare = (a: string, b: string)=> {
    var ax: string[] = [], bx: string[] = [];

    /// @ts-expect-error
    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    /// @ts-expect-error
    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
    
    while(ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        /// @ts-expect-error
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
    }

    return ax.length - bx.length;
}
