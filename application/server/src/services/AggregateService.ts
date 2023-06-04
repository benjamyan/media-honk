import { default as Fs } from 'fs';
import { ProcedureService } from './ProcedureService';
import { shakeDirectoryFileTree } from './modules/fileSystem';
import { MediaConfigProperties } from './factories/MediaPropertiesFactory';
import { BundlesModel, MetaModel } from '../models';
import { MediaHonkServerBase } from '../_Base';

let AggregateServiceIntermediary: AggregateService = null!;

export class AggregateService extends MediaHonkServerBase {
    public routine: Record<string, ()=> void | Promise<void>> = {
        backupDatabase: this.createDatabaseBackup
    }
    
    private mediaDir: string = null!;
    private configCache: Record<string, MediaConfigProperties> = {};
    
    constructor() {
        super();
        
    }

    static get instance() {
        if (AggregateServiceIntermediary === null) {
            AggregateServiceIntermediary = new AggregateService();
        }
        return AggregateServiceIntermediary
    }

    public async handleAggregateRoutine(aggregationType: typeof process.env.AGGREGATION_TYPE) {
        this.logger('AggregateService.handleAggregateRoutine()');
        switch (aggregationType) {
            case 'remake': {
                /** 
                 * Create backup
                 * Drop all tables
                 * Run aggregate
                 */
                

                break;
            }
            case 'update': {
                /** 
                 * Add new entries
                 * Overwrite existing entries 
                 * Delete nonexistent entries
                 */
                // this.createDatabaseBackup();
                // this.handleTableEntryComparison({
                //     tableName: 'sources',
                //     comparisonKey: 'abs_url',
                //     comparisonData: this.config.api.media_paths,
                //     factoryCallback: (dataKey)=> ({
                //         abs_url: this.config.api.media_paths[dataKey],
                //         title: dataKey
                //     })
                // });
                // await this.routine.updateSourcesTable();
                await this.handleMediaEntryAggregation({
                    overwrite: false
                });
                break;
            }
            case 'add': {
                /**
                 * Adds new entries to database
                 * Dont overwrite or delete existing entries
                 */

                break;
            }
            default: {
                this.emit('error', {
                    error: new Error(`Invalid aggregation routine given: ${ aggregationType || '__UNDEFINED__'}`),
                    severity: 1
                })
            }
        }
    }

    /**
     * @method createDatabaseBackup will write a backup of the current database to the file system. 
     * @description Backup will be the database name appended with the time and date, with an extension of `.bak.db`
     */
    private createDatabaseBackup() {
        this.logger('AggregateService.createDatabaseBackup()');
        
    }

    /**
     * @method handleMediaEntryAggregation Traverses the entries in the local configuration (yaml) and processes the directories inside for media entries
     * 
     * @param options 
     * @returns 
     */
    private async handleMediaEntryAggregation(options?: {
        overwrite?: boolean
    }): Promise<boolean> {
        this.logger('AggregateService.handleMediaEntryAggregation()');

        const _self = this;
        try {
            const attemptMediaAggregate = async (_omitConfigCheck?: boolean)=> {
                try {
                    const directoryContent = await shakeDirectoryFileTree(_self.mediaDir);
                    if (directoryContent instanceof Error) throw directoryContent;
                    if (directoryContent.length == 0) return;
                    
                    /** Determine whether the current path contains any directories */
                    const hasSubDir = (
                            directoryContent
                                .map((path)=> {
                                    if (Fs.statSync(path).isDirectory() == true) {
                                        return path
                                    }
                                    return false
                                })
                                .filter(Boolean)
                        ) as Array<string>;

                    /** 
                     * If the directory has a yaml file, its considered to have been configured. 
                     * - `true` were omitting the check and using an old yaml file found in a parent
                     * - `string` direct path to the config yaml file
                     * - `undefined` no yaml file found, directory not pre-configured
                     * */
                    let isMediaDir = directoryContent.find((file)=>file.endsWith('yaml'));
                    if (!!isMediaDir/* && omitConfigCheck*/) {
                        _self.configCache[isMediaDir] = new MediaConfigProperties({
                            _mediaDir: _self.mediaDir,
                            _configFilePath: isMediaDir
                        });
                    }

                    if (hasSubDir.length > 0) {
                        for await (const subDir of hasSubDir) {
                            _self.mediaDir = subDir;
                            await attemptMediaAggregate(!!isMediaDir ? true : undefined);
                        }
                    }
                } catch (err) {
                    this.emit('error', err instanceof Error ? err : new Error(`Unhandled exception: `))
                }
                return;
            };
            
            for await (const mediaPath of Object.keys(this.config.api.media_paths)) {
                _self.mediaDir = this.config.api.media_paths[mediaPath];
                await attemptMediaAggregate();
            }
            
            for await (const configFile of Object.keys(_self.configCache)) {
                await _self.configCache[configFile].init();
                await MetaModel.insertManyMetaRows({
                    artists: _self.configCache[configFile].properties.artists || [],
                    categories: _self.configCache[configFile].properties.categories || []
                })
            }
            
            for await (const configFile of Object.keys(_self.configCache)) {
                await BundlesModel.handleBundleEntryWithRelatedFields(_self.configCache[configFile].properties);
            }
            
            return true;
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 1
            })
            return false
        }
    }
    
}

