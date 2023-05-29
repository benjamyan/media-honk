import { default as Yaml } from 'yaml';
import { default as Fs } from 'fs';
import { hasValidMediaProperties, mapDeprecatedToValidKeys } from "./mediaEntry";
import { MediaFactory } from '../../factories';
import { deteremineMediaEntryType, shakeDirectoryFileTree } from './fileSystem';
import { Constants } from '../../config';
import { MediaHonkServerBase } from '../../_Base';

// type ConfigFileContent = Honk.Media.BasicLibraryEntry & {
//     _dirFileList: string[];
//     _configFilePath: string;
//     _mediaDir: string;
//     new: (args0: Pick<ConfigFileContent, '_configFilePath' | '_mediaDir'>)=> ConfigFileContent;
//     // construct: ()=> ConfigFileContent;
// }
export interface MediaConfigPropertyList {
    _dirFileList: string[] | undefined;
    _configFilePath: string;
    _mediaDir: string;
    properties: Honk.Media.BasicLibraryEntry;
}

export class MediaConfigProperties implements MediaConfigPropertyList {
    _configFilePath: string;
    _mediaDir: string;
    _dirFileList!: string[];
    properties: Honk.Media.BasicLibraryEntry;
    
    constructor(mediaConfigArgs: Pick<MediaConfigPropertyList, '_configFilePath' | '_mediaDir'>) {
        this._mediaDir = mediaConfigArgs._mediaDir;
        this._configFilePath = mediaConfigArgs._configFilePath;
        this.properties = Yaml.parse(Fs.readFileSync(this._configFilePath, 'utf-8'));
    }

    public async init() {
        await this.getDirFileList()
        this.getMediaEntryList();
        this.getMediaType();
        this.getCoverImageUrl();
    }

    private async getDirFileList() {
        const directoryFiles = await shakeDirectoryFileTree(this._mediaDir);
        if (directoryFiles instanceof Error) {
            console.error(`Could not shake files for configFile Entries.`)
            this._dirFileList = [];
        } else {
            this._dirFileList = directoryFiles;
        }
    }

    private getMediaType(){
        if (this.properties.type === undefined) {
            this.properties.type = deteremineMediaEntryType(this._dirFileList);
        }
        return this.properties.type
    }

    private getCoverImageUrl() {
        if (this.properties.coverUrl === undefined) {
            this.properties.coverUrl = this._dirFileList.find((entryFile)=>{
                for (const ext of Constants.imageExtensions) {
                    if (entryFile.includes(ext)) return entryFile
                }
            });
        }
        return this.properties.coverUrl
    }

    private getMediaEntryList() {
        if (this.properties.entries === undefined) {
            this.properties.entries = MediaFactory.formatMediaEntries(
                this._dirFileList.filter((currProperty)=> (
                    currProperty !== this.properties.coverUrl && currProperty !== this._configFilePath
                )),
                this._mediaDir,
                this.properties
            );
        }
        return this.properties.entries
    }
}

// const MediaConfigProxyHandler = {
//     set(mediaEntry: MediaConfigPropertyList, key: keyof MediaConfigPropertyList, value: MediaConfigPropertyList[keyof MediaConfigPropertyList]) {
//         mediaEntry[key] = value as any;
//         return true   
//     },
//     get(mediaEntry: MediaConfigPropertyList, key: keyof MediaConfigPropertyList) {
//         let requested: any;
//         switch (key) {
//             case 'entries': {
//                 if (mediaEntry.entries === undefined) {
//                     mediaEntry.entries = MediaFactory.formatMediaEntries(
//                         mediaEntry._dirFileList.filter(
//                             (currProperty)=> currProperty !== mediaEntry.coverUrl && currProperty !== mediaEntry._configFilePath
//                         ),
//                         mediaEntry._mediaDir,
//                         mediaEntry
//                     );
//                 }
//                 requested = mediaEntry.entries;
//             }
//             case 'type': {
//                 if (mediaEntry.type === undefined) {
//                     mediaEntry.type = deteremineMediaEntryType(mediaEntry._dirFileList);
//                 }
//                 requested = mediaEntry.type;
//             }
//             case 'coverUrl': {
//                 if (mediaEntry.coverUrl === undefined) {
//                     mediaEntry.coverUrl = mediaEntry._dirFileList.find((entryFile)=>{
//                         for (const ext of Constants.imageExtensions) {
//                             if (entryFile.includes(ext)) return entryFile
//                         }
//                     });
//                 }
//                 requested = mediaEntry.coverUrl
//             }
//             default: {
//                 requested = mediaEntry[key];
//             }
//         }
//         return requested;
//     },
//     construct(MediaConfigConstructor: typeof MediaConfigProperties, args: [Pick<MediaConfigPropertyList, '_configFilePath' | '_mediaDir'>]) {
//         const { _configFilePath,_mediaDir } = args[0];
//         let mediaEntry: MediaConfigPropertyList;

//         // if (_mediaDir === undefined) return new Error(`Media directory undefined`);
//         // if (_configFilePath === undefined) return new Error(`File path undefined`);

//         mediaEntry = Yaml.parse(Fs.readFileSync(_configFilePath, 'utf-8'));
//         mediaEntry._configFilePath = _configFilePath;
//         mediaEntry._mediaDir = _mediaDir;

//         if (MediaHonkServerBase.settings.DEPRECATED_DEFS) {
//             mediaEntry = {
//                 ...mediaEntry,
//                 ...mapDeprecatedToValidKeys({
//                     mediaEntry,
//                     dirPath: _mediaDir
//                 })
//             }
//         }

//         // if (mediaEntry._dirFileList == undefined) {
//         //     const directoryFiles = await shakeDirectoryFileTree(_configFilePath);
//         //     if (directoryFiles instanceof Error) {
//         //         console.error(`Could not shake files for configFile Entries.`)
//         //         mediaEntry._dirFileList = [];
//         //     } else {
//         //         mediaEntry._dirFileList = directoryFiles;
//         //     }
//         // }

//         // if (hasValidMediaProperties(mediaEntry) instanceof Error) {
//         //     return new Error(`- Invalid configuration: ${_configFilePath}`)
//         // }
//         // return Reflect.construct(MediaConfigConstructor, args, mediaEntry);
//         return new MediaConfigConstructor(mediaEntry);
//     }
// };

// export const MediaProperties = new Proxy(MediaConfigProperties, MediaConfigProxyHandler);

// const MediaConfig = async ()=> {
//     const newMediaConfig = new Proxy(MediaConfigProperties, MediaConfigProxyHandler)
// };