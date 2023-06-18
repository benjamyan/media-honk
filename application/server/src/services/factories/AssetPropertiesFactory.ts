import { default as Yaml } from 'yaml';
import { default as Fs } from 'fs';
import {convertToStoredMediaType, formatMediaEntries} from '../../utils/assetEntries'
import { deteremineStoredMediaType, naturalCompare, shakeDirectoryFileTree } from '../../utils/fileSystem';
import { Constants } from '../../config';
import { ResolvedMediaAssetProperties, ConfiguredMediaAssetProperties } from '../../types/MediaProperties';
import { MediaHonkServerBase } from '../../_Base';

export interface AssetPropertyConfigPublicEntity {
    _dirFileList: string[] | undefined;
    _configFilePath: string;
    _mediaDir: string;
    properties: ResolvedMediaAssetProperties;
}

export class AssetPropertiesConfig implements AssetPropertyConfigPublicEntity {
    public _configFilePath: string;
    public _mediaDir: string;
    public _dirFileList!: string[];
    readonly properties: ResolvedMediaAssetProperties;
    private configuration: ConfiguredMediaAssetProperties;
    
    constructor(mediaConfigArgs: Pick<AssetPropertyConfigPublicEntity, '_configFilePath' | '_mediaDir'>) {
        this._mediaDir = mediaConfigArgs._mediaDir;
        this._configFilePath = mediaConfigArgs._configFilePath;
        this.configuration = Yaml.parse(Fs.readFileSync(this._configFilePath, 'utf-8'));
        this.properties = { 
            ...this.configuration, 
            entries: null!,
            type: null!,
            coverUrl: null!
        }
    }

    public async init() {
        try {
            await this.getDirFileList()
            this.getMediaEntryList();
            this.getMediaType();
            this.getCoverImageUrl();
        } catch (err) {
            MediaHonkServerBase.emitter('error', {
                error: err,
                severity: 2
            })
        }
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
        if (!this.configuration.type) {
            this.properties.type = deteremineStoredMediaType(this._dirFileList);
        } else {
            this.properties.type = convertToStoredMediaType(this.configuration.type);
        }
        return this.properties.type
    }

    private getCoverImageUrl() {
        if (this.properties.coverUrl === null) {
            this.properties.coverUrl = this._dirFileList.find((entryFile)=>{
                for (const ext of Constants.imageExtensions) {
                    if (entryFile.includes(ext)) return entryFile
                }
            });
        }
        return this.properties.coverUrl
    }

    private getMediaEntryList() {
        if (this.properties.entries === null) {
            this.properties.entries = formatMediaEntries(
                this._dirFileList.sort(naturalCompare).filter((currProperty)=> (
                    currProperty !== this.properties.coverUrl && currProperty !== this._configFilePath
                )),
                this._mediaDir,
                this.configuration
            );
        }
        return this.properties.entries
    }
}
