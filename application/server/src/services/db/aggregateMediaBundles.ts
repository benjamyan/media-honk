import { default as Fs } from 'fs';
import { MetaModel, BundlesModel } from "../../models";
import { AssetPropertiesConfig } from "../factories/AssetPropertiesFactory";
import { shakeDirectoryFileTree } from "../fs/shakeDirectoryTree";
import { $Logger, _Config } from '../../server';

/**
 * @method handleMediaEntryAggregation Traverses the entries in the local configuration (yaml) and processes the directories inside for media entries
 * 
 * @param options 
 * @returns 
 */
export const aggregateMediaBundles = async (options?: {
    overwrite?: boolean
})=> {
        const _self = {
            mediaDir: <string> null!,
            configCache: <Record<string, AssetPropertiesConfig>> {}
        };
        
        $Logger.info('- START AGGREGATE');
        try {
            const attemptMediaAggregate = async (parentConfigFile?: string)=> {
                try {
                    const directoryContent = (
                        parentConfigFile
                            ? null
                            : await shakeDirectoryFileTree(_self.mediaDir)
                    );
                    if (directoryContent instanceof Error) throw directoryContent;
                    let hasSubDir: string[] | undefined,
                        isMediaDir: string | undefined;
                    if (Array.isArray(directoryContent)) {
                        if (directoryContent.length == 0) return;
                        /** Determine whether the current path contains any directories */
                        hasSubDir = directoryContent.filter((path)=>Fs.statSync(path).isDirectory());
                        /** If the directory has a configuration file */
                        isMediaDir = directoryContent.find((file)=>file.endsWith('yaml'));
                    }
                    

                    /** 
                     * If the directory has a yaml file, its considered to have been configured. 
                     * - `true` were omitting the check and using an old yaml file found in a parent
                     * - `string` direct path to the config yaml file
                     * - `undefined` no yaml file found, directory not pre-configured
                     * */
                    if (!!isMediaDir/* && omitConfigCheck*/) {
                        _self.configCache[_self.mediaDir] = new AssetPropertiesConfig({
                            _mediaDir: _self.mediaDir,
                            _configFilePath: isMediaDir
                        });
                        if (hasSubDir) {
                            for (const dir of hasSubDir) {
                                _self.configCache[dir] = new AssetPropertiesConfig({
                                    _mediaDir: dir,
                                    _configFilePath: isMediaDir
                                });
                            }
                        }
                    }

                    if (hasSubDir!.length > 0 && !isMediaDir) {
                        for await (const subDir of hasSubDir!) {
                            _self.mediaDir = subDir;
                            await attemptMediaAggregate(undefined);
                            // await attemptMediaAggregate(!!isMediaDir ? true : undefined);
                        }
                    }
                } catch (err) {
                    // this.emit('error', err instanceof Error ? err : new Error(`Unhandled exception: `))
                }
                return;
            };
            
            for await (const mediaPath of Object.keys(_Config.local.api.media_paths)) {
                _self.mediaDir = _Config.local.api.media_paths[mediaPath];
                if (_Config.cli.FAKER_ENV == 'db') {
                    
                } else {
                    await attemptMediaAggregate();
                }
            }
            
            /* 
             Loop through the entries and insert the meta values first 
             so each bundle can relate back to it
             */
            for await (const configFile of Object.keys(_self.configCache)) {
                try {
                    await _self.configCache[configFile].init();
                    await MetaModel.insertManyMetaRows({
                        artists: _self.configCache[configFile].properties.artists || [],
                        categories: _self.configCache[configFile].properties.categories || []
                    })
                } catch (err) {
                    console.warn(err);
                    delete _self.configCache[configFile];
                }
            }
            
            await Promise.all([
                ...Object.keys(_self.configCache).map((configFile)=> {
                    return (
                        BundlesModel.handleBundleEntryWithRelatedFields(_self.configCache[configFile].properties)
                            .then(()=> {
                                $Logger.info(`-- ${_self.configCache[configFile]['_mediaDir']}`);
                            })
                            .catch((err)=> {
                                $Logger.warn(`-- ERR: ${_self.configCache[configFile]['_configFilePath']}`);
                                $Logger.warn(err);
                                delete _self.configCache[configFile];
                            })
                    )
                })
            ]);
            $Logger.info('- END AGGREGATE');
            return true;
        } catch (err) {
            // this.emit('error', {
            //     error: err,
            //     severity: 1
            // })
            return false
        }
    }