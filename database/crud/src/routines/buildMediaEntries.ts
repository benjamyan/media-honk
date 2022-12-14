import { default as Fs, PathLike, promises as Fsp } from 'node:fs';
import * as Path from 'node:path';
import * as Yaml from 'yaml';

import { Honk, constants } from 'mediahonk';
import { LocalConfig, MediaDB } from '../'
import { StringUtil } from '../utils';
import { addNewMediaEntry } from '../statements'

type LibEntryReturnType = Omit<Honk.Media.BasicLibraryEntry, 'sourceName' | 'sourceUrl'>;

const factory_libraryEntry = (entry: string, properties: Honk.Media.BaselineMediaProperties): LibEntryReturnType => ({
	relativeUrl: entry + '/',
	entries: [],
	coverImageUri: undefined,
	...properties
});

const processDirectoryEntry = async (entry: string): Promise<LibEntryReturnType| undefined> => {
	const directoryContent: string[] | void = (
		await Fsp.readdir(entry)
			.then(children=> children)
			.catch(err=> console.log(err))
	);
	let exitMediaProcess: boolean = false;
	
	processProperties:
	if (Array.isArray(directoryContent) && directoryContent.length > 0) {
		const yamlFileIndex = directoryContent.findIndex( (file)=>file.endsWith('yaml') );
		if (yamlFileIndex === -1) {
			exitMediaProcess = true;
			break processProperties;
		}
		const file = await Fsp.readFile(Path.resolve(entry, directoryContent[yamlFileIndex]), 'utf8');
		const propertiesContent = Yaml.parse(file);
		const libEntry = { 
			...factory_libraryEntry(entry, propertiesContent) 
		};
		directoryContent.splice(yamlFileIndex, 1);
		
        let fileExt: string,
            fileName: string;
			
		parseDirectoryContent:
		for await (const dirFile of directoryContent) {
			try {
				fileExt = dirFile.split('.').slice(-1)[0];
				fileName = dirFile.split('.')[0];
				
				if (constants.mediaExtensions.includes(fileExt)) {

					/** Check cover images, need to return so covers dont get persisted on a media table */
					if (constants.imageExtensions.includes(fileExt)) {
						if (fileName === constants.coverImageOverrideName) {
							/** If the override name is provided as the filename then the cover image is assigned, and the current file will not be added to our media array (and table) */
							libEntry.coverImageUri = dirFile;
							continue parseDirectoryContent;
						}
						if (libEntry.coverImageUri === undefined || libEntry.coverImageUri.length === 0) {
							/** The first image found will count as our cover, but will still be added to the media array */
							libEntry.coverImageUri = dirFile;
						}
					}
					
					/** Parse for the title and pass in our index to ensure proper ordering */
					libEntry.entries.push({
						index: libEntry.entries.length + 1,
						filename: dirFile,
						title: StringUtil.standardizeTitleFormat(fileName.toLowerCase(), {
							removeStrings: Array.isArray(libEntry.artists) ? [...libEntry.artists] : [],
							selectiveUppercase: true
						})
					})
				}
			} catch (err) {
				console.log(err)
			}
		}
		
		return !exitMediaProcess ? libEntry : undefined
	} else {
		return undefined
	}
	
};

const parseFilesForLibrary = async (source: string, dir: PathLike): Promise<Honk.Media.BasicLibraryEntry[]> => {
	const dirents = await Fsp.readdir(dir, { withFileTypes: true });
	let accumulator: Omit<Honk.Media.BasicLibraryEntry, 'uuid'>[] = [];

	for await (const dirent of dirents) {
		try {
			
			const res = Path.resolve(dir as string, dirent.name);
			let childEntries: any,
				entryAttempt: LibEntryReturnType | undefined,
                entrySource: PathLike | undefined;

			if (Fs.existsSync(Path.join(res, 'properties.yaml'))) {
				console.log(`    Processing: ${dirent.name}`);

				entryAttempt = await processDirectoryEntry(res);
                entrySource = (
                    MediaDB.source.length === 0
                        ? LocalConfig.api.media_paths[source]
                        : MediaDB.source.find( (src)=>src.title === source )?.abs_url
                );

                if (entryAttempt === undefined) {
                    throw new Error('Failure to compile on ' + dirent.name)
                } else if (entrySource === undefined) {
                    throw new Error(`Failed to find source "${source}" while processing "${dirent.name}"`)
                }
				accumulator.push({
                    ...entryAttempt,
                    sourceUrl: entrySource,
                    relativeUrl: (entryAttempt.relativeUrl as string).split(entrySource as string)[1]
                })
				// console.log(`-- -- END: ${dirent.name}\n`)
			} else if (dirents.length > 0) {
				// console.log(`\n-- DIR: ${dirent.name}`)
				childEntries = await parseFilesForLibrary(source, res);
				if (Array.isArray(childEntries)) {
					
					accumulator = [ ...accumulator, ...childEntries ]
				}
				// console.log(`-- END: ${dirent.name}\n`)
			}
			
			Promise.resolve(0)
			// return 0
		} catch (err) {
			console.log(err)
			// console.log(`-- -- END: ${dirent.name}\n`)
			
			Promise.resolve(1)
			// return 0
		}
	}
	
	return accumulator
};

export async function buildMediaEntries(): Promise<Omit<Honk.Media.BasicLibraryEntry, 'uuid'>[]> {
	try {

		const configMediaPaths = LocalConfig.api.media_paths;
		if (!!configMediaPaths) {
            const mediaLibraryEntries: Honk.Media.BasicLibraryEntry[] = [];
            
            for await (const entry of Object.entries(configMediaPaths)) {
				console.log(`\nParsing: "${entry[1]}"`)
                await parseFilesForLibrary(entry[0], entry[1])
                    .then((result)=> {
                        console.log(`Finished "${entry[1]}" found ${result.length} media bundles\n`);
                        if (Array.isArray(result)) {
                            mediaLibraryEntries.push(...result.filter(Boolean))
                        }
                    })
                    .catch((err)=> {
                        console.warn(err)
                        //
                    })
            }
			
			if (mediaLibraryEntries.length > 0) {
                for await (const entry of mediaLibraryEntries) {
                    await addNewMediaEntry(entry);
                }
				return mediaLibraryEntries
			} else {
				throw new Error('No entries')
			}
		} else {
			throw new Error('Invalid path')
		}
	} catch (err) {
		if (err instanceof Error) {
			console.log(err)
		} else {
			console.log('Unhandled exception')
		}
		return []
	}
}
