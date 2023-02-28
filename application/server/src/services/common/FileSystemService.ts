import { default as Fs, promises as Fsp } from 'fs';
import { default as Path } from 'path';

import { MediaHonkServerBase } from "../../_Base";

let FileSystemServiceIntermediary: FileSystemService = null!;

export class FileSystemService extends MediaHonkServerBase {
    private constructor() {
        super();

    }

    static get instance() {
        if (FileSystemServiceIntermediary === null) {
            FileSystemServiceIntermediary = new FileSystemService();
        }
        return FileSystemServiceIntermediary
    }
    
    /**
     * @method shakeDirectoryFileTree 
     * @description A generic method to shake a directory structure. Will recursively traverse a directory tree searching for files of a specific extension, and append those files to the result. 
     * @param paths
     * - An __absolute__ file path on the system which this service has access to
     * @param fileType
     * - Requires a __minimum__ of one entry.
     * - An array containing the file with extensions you want to search for. 
     * - Can accept just an extension, or an entire filename _including_ extension
     * @returns An array of absolute file paths matching the given fileType parameter with entries of the following:
     * - An absolute filepath to a specific file 
     * - If an error has occured: A directory appended with an error indiciating something went wrong
     */
    public shakeDirectoryFileTree = async (pathname: string, fileType: string[]/*[string, ...string[]]*/): Promise<Array<string>> => {
        let shakenFiles: string[] = [];

        try {
            if (!Fs.existsSync(pathname)) {
                this.emit('error', new Error(`FS_ERROR_FAILED_FILEPATH: ${pathname}`))
            } else {
                const shakeResult: string[] | Error = await new Promise(async (resolve, reject)=>{
                    let traversalResult: string[] = [];

                    try {
                        const directoryEntries = await Fsp.readdir(pathname, { withFileTypes: true });
                        
                        for await (const entry of directoryEntries) {
                            if (entry.isDirectory()) {
                                traversalResult = traversalResult.concat(
                                    await this.shakeDirectoryFileTree(Path.join(pathname, entry.name), fileType)
                                );
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
                    this.emit('error', `FS_ERROR_TRAVERSAL_FAILURE: ${pathname}`)
                } else if (shakeResult.length > 0) {
                    shakenFiles = shakenFiles.concat(shakeResult)
                }
                // console.log(shakenFiles)
            }
        } catch (err) {
            this.emit('error', new Error(`FS_ERROR_UNHANDLED: ${pathname}`))
        }
        return shakenFiles;
    }

}