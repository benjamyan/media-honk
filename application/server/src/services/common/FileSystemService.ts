import { default as Fs, promises as Fsp } from 'fs';
import { default as Yaml } from 'yaml';
import { default as Path } from 'path';

import { MediaHonkServerBase } from "../../_Base";

let libraryDefinitionFileContents: Honk.Media.BaselineMediaProperties[] = null!;

export class FileSystemService extends MediaHonkServerBase {
    constructor() {
        super();

    }

    get systemLibraryDefinitions(): typeof libraryDefinitionFileContents {
        if (!Array.isArray(libraryDefinitionFileContents)) {
            this.shakeMediaSourceDefinitionFiles();
        }
        return libraryDefinitionFileContents
    }

    private shakeMediaSourceDefinitionFiles = async ()=> {
        try {
            const userMediaPaths = this.config.api.media_paths;
            for (const path in userMediaPaths) {
                if (!Fs.existsSync(path)) {
                    continue
                }
                
            }

            // if (!!userMediaPaths) {
            //     const mediaLibraryEntries = Promise.all(
            //         Object.entries(userMediaPaths as Record<string, string>)
            //             .map( (path: [string, string])=> {
            //                 Fsp.readdir(path[1])
            //                     .then((children)=> [
            //                         children
            //                     ])
            //                     .catch(err=> console.log(err))
            //                         const entriesFromPath = await parseFilesForLibrary(path[0], path[1]);
            //                         return entriesFromPath
            //                     })
            //             .filter(Boolean)
            //             .flat(1)
            //     );
            //     if (Object.entries(mediaLibraryEntries).length > 0) {
            //         return mediaLibraryEntries.flat(1)
            //     } else {
            //         throw new Error('No entries')
            //     }
            // } else {
            //     throw new Error('Invalid path')
            // }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err)
            } else {
                console.log('Unhandled exception')
            }
            return []
        }
    }

}