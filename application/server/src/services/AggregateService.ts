import { default as Yaml } from 'yaml';
import { default as Fs } from 'fs';

import { FileSystemService, ModelService } from "./common";
import { ValidationService } from './ValidationService';
import { ProcedureService } from './ProcedureService';
import { MediaFactory } from '../factories';
import { Constants } from '../config';

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
                                // this.logger(`\n- START ${fileContent.title} ${fileContent.subtitle || ''}`);
                                
                                if (this.settings.DEPRECATED_DEFS) {
                                    if ((fileContent as any).actors) {
                                        if (Array.isArray((fileContent as any).actors)) {
                                            fileContent.artists = [...(fileContent as any).actors];
                                        } else {
                                            fileContent.artists = [(fileContent as any).actors];
                                        }
                                        delete (fileContent as any).actors;
                                    }
                                }

                                if (!fileContent) {
                                    this.emit('error', new Error(`- No yaml configuration: ${file}`));
                                    continue;
                                } else {
                                    const isFileContentValid = (
                                        ValidationService.instance.permissibleMediaProperties(fileContent)
                                    )
                                    if (isFileContentValid instanceof Error) {
                                        this.emit('error', new Error(`- Invalid yaml configuration: ${file}`));
                                        this.emit('error', `-- ${isFileContentValid.message}`)
                                        continue;
                                    }
                                }
                                

                                await this.FsService.shakeDirectoryFileTree(
                                    file.replace(file.split('/').at(-1) as string, ''),
                                    Constants.includeExtensions
                                )
                                .then((entryResult)=>{
                                    fileContent.coverUrl = entryResult.find((entryFile)=>{
                                        for (const ext of Constants.imageExtensions) {
                                            if (entryFile.includes(ext)) return entryFile
                                        }
                                    });
                                    fileContent.entries = MediaFactory.formatMediaEntries(
                                        entryResult.filter(
                                            (mediaEntry)=> mediaEntry !== fileContent.coverUrl
                                        ),
                                        this.config.api.media_paths[mediaPath],
                                        fileContent
                                    );
                                })
                                .then(async ()=>{
                                    if (fileContent.entries.length === 0) {
                                        throw new Error(`No entries for media: ${fileContent.title}`);
                                    }
                                    await this.db.Bundles.handleBundleEntryWithRelatedFields(fileContent);
                                })
                                .catch(err=>{
                                    this.emit(
                                        'error', 
                                        err instanceof Error 
                                            ? `${fileContent.title}\n${err}` 
                                            : new Error(`Unhandled exception when parsing media entries: ${file}`)
                                    );
                                })
                                .finally(()=>{
                                    // this.logger(`- DONE ${fileContent.title} ${fileContent.subtitle || ''}`)
                                })
                            }
                        })
                        .catch((error)=>{
                            this.emit('error', {
                                error, severity: 2
                            })
                        })
                );
            }
            
            // Object.values(mediaPathYamlEntries).flat(1).reduce(async (initialPromise, media)=>{
            //     await initialPromise;
            //     if (media.title.indexOf('uturama') > -1) {
            //         console.log({...media})
            //     }
            //     if (media.entries.length > 0) {
            //         await (
            //             this.db.Bundles
            //                 .handleBundleEntryWithRelatedFields(media)
            //                 .then((result)=> {
            //                     // console.log(result)
            //                 })
            //                 .catch((err)=> {
            //                     console.log(err)
            //                 })
            //         )
            //     }
            // }, Promise.resolve())
            
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

