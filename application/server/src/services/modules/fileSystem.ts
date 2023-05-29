import { MediaHonkServerBase } from '../../_Base'
import { default as Fs, promises as Fsp } from 'fs';
import { default as Path } from 'path';

export const deteremineMediaEntryType = (dirContent: string[]): Honk.Media.AcceptedMediaTypes => {
    // const dirContent = await Fsp.readdir(dirPath, { withFileTypes: true });
    
    return 'movie';
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
