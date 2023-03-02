import { default as Yaml } from 'yaml';
import { default as Fs } from 'fs';

import { FactoryService, FileSystemService, ModelService } from "./common";
import { ValidationService } from './ValidationService';
import { ProcedureService } from './ProcedureService';
import { Constants } from '../utils';

export class AggregateService extends ProcedureService {
    private FsService: FileSystemService = FileSystemService.instance;
    public routine: Record<string, ()=> void | Promise<void>> = {
        backupDatabase: this.createDatabaseBackup,
        updateSourcesTable: async ()=> (
            await ModelService.instance.handleTableEntryComparison({
                tableName: 'sources',
                comparisonKey: 'abs_url',
                comparisonData: this.config.api.media_paths,
                factoryCallback: (dataKey)=> ({
                    abs_url: this.config.api.media_paths[dataKey],
                    title: dataKey
                })
            })
        )
    }

    constructor() {
        super();
        
    }
    
    public async handleAggregateRoutine(aggregationType: typeof process.env.AGGREGATE) {
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
                await this.routine.updateSourcesTable();
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

    private async handleMediaEntryAggregation(options?: {
        overwrite?: boolean
    }): Promise<boolean> {
        this.logger('AggregateService.handleMediaEntryAggregation()');
        try {
            const mediaPathYamlEntries = Object.assign(
                {},
                Object.keys(this.config.api.media_paths).reduce(
                    (accumulator, mediaPath: string)=>({
                        ...accumulator,
                        [mediaPath]: []
                    }), 
                    {} as Record<string, Honk.Media.BasicLibraryEntry[]>
                )
            );
            let fileContent: Honk.Media.BasicLibraryEntry;

            for await (const mediaPath of Object.keys(mediaPathYamlEntries)) {
                await (
                    this.FsService
                        .shakeDirectoryFileTree(this.config.api.media_paths[mediaPath], ['yaml'])
                        .then(async (shakeResult)=>{
                            for await (const file of shakeResult) {
                                fileContent = Yaml.parse(Fs.readFileSync(file, 'utf-8'));
                                
                                if (!fileContent || ValidationService.instance.permissibleMediaProperties(fileContent) instanceof Error) {
                                    this.emit('error', new Error(`Invalid yaml configuration: ${file}`));
                                    continue;
                                } else {
                                    await this.FsService.shakeDirectoryFileTree(
                                        file.replace(file.split('/').at(-1) as string, ''),
                                        Constants.includeExtensions
                                    )
                                    .then((entryResult)=>{
                                        mediaPathYamlEntries[mediaPath].push({
                                            ...fileContent,
                                            coverUrl: entryResult.find((entryFile)=>{
                                                for (const ext of Constants.imageExtensions) {
                                                    if (entryFile.includes(ext)) return entryFile
                                                }
                                            }),
                                            entries: FactoryService.instance.formatMediaEntries(
                                                entryResult,
                                                this.config.api.media_paths[mediaPath],
                                                fileContent
                                            )
                                        });
                                    })
                                    .catch(err=>{
                                        this.emit(
                                            'error', 
                                            err instanceof Error ? err : new Error(`Unhandled exception when parsing media entries: ${file}`)
                                        );
                                    })
                                }
                            }
                        })
                        .catch((err)=>{
                            this.emit('error', {
                                error: err,
                                severity: 2
                            })
                        })
                );
            }
            for await (const entry of Object.entries(mediaPathYamlEntries)) {
                for await (const media of entry[1]) {
                    if (media.entries.length === 0) continue;
                    this.db.Bundles.insertBundleWithRelatedFields(media)
                    // this.insertMediaEntry(media, overwrite);
                }
            }
            return true;
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 1
            })
        }
        return false
    }
    

}

