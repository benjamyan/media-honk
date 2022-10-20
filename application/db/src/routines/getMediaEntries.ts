import { default as Fs, promises as Fsp } from 'node:fs';
import * as Path from 'node:path';
import * as Yaml from 'yaml';

import { Honk, constants } from 'mediahonk';

type LibEntryReturnType = Omit<Honk.BasicLibraryEntry, 'mediaSource'>;

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
		const libEntry: LibEntryReturnType = {
			baseUrl: entry + '/',
			mediaUrl: {},
			// audioUrl: undefined,
			coverUrl: undefined,
			...propertiesContent
		};
		directoryContent.splice(yamlFileIndex, 1);
		
		await Promise.all(directoryContent.map( async (dirFile: string): Promise<void> => {
			const fileExt = dirFile.split('.').slice(-1)[0];
			const fileName = dirFile.split('.')[0];
			
			if (constants.imageExtensions.includes(fileExt)) {
				if (libEntry.coverUrl === undefined || libEntry.coverUrl.length === 0) {
					libEntry.coverUrl = dirFile;
				}
				// if (libEntry.type === 'gallery') {
					libEntry.mediaUrl[fileName] = dirFile;
				// }
			}

			if (constants.videoExtensions.includes(fileExt)) {
				// if (libEntry.type === 'series') {
				// 	libEntry.mediaUrl[fileName] = dirFile;
				// } else {
					libEntry.mediaUrl[fileName] = dirFile;
				// }
			}

			if (constants.audioExtensions.includes(fileExt)) {
				// if (libEntry.type === 'album' || libEntry.type === 'singles') {
					libEntry.mediaUrl[fileName] = dirFile;
				// }
			}
			
		}));
		
		return !exitMediaProcess ? libEntry : undefined
	} else {
		return undefined
	}
	
};

const parseFilesForLibrary = async (source: string, dir: string): Promise<Honk.BasicLibraryEntry[]> => {
	const dirents = await Fsp.readdir(dir, { withFileTypes: true });
	let accumulator: Omit<Honk.BasicLibraryEntry, 'uuid'>[] = [];

	await Promise.all(dirents.map(async (dirent, _index, dirents) => {
		try {
			const res = Path.resolve(dir, dirent.name);
			let childEntries: any,
				entryAttempt: LibEntryReturnType | undefined;

			if (Fs.existsSync(Path.join(res, 'properties.yaml'))) {
				entryAttempt = await processDirectoryEntry(res);
				if (entryAttempt !== undefined) {
					accumulator.push({
						...entryAttempt,
						mediaSource: source,
						baseUrl: entryAttempt.baseUrl.split(source)[1]
					})
				} else throw new Error('Failure to compile on ' + dirent.name)
			} else if (dirents.length > 0) {
				childEntries = await parseFilesForLibrary(source, res);
				if (Array.isArray(childEntries)) {
					accumulator = [ ...accumulator, ...childEntries ]
				}
			}
			return 0
		} catch (err) {
			console.log(err)
			return 0
		}
	}));
	return accumulator
};

export async function getMediaEntries(localConfig: Honk.Configuration): Promise<Omit<Honk.BasicLibraryEntry, 'uuid'>[]> {
	try {
		const userMediaPaths = localConfig.serve.media_paths;
		if (!!userMediaPaths) {
			const mediaLibraryEntries = await Promise.all(
				Object.entries(userMediaPaths as Record<string, string>)
					.map( async (path: [string, string])=> {
						const entriesFromPath = await parseFilesForLibrary(path[0], path[1]);
						return entriesFromPath
					})
					.filter(Boolean)
					.flat(1)
			);
			if (Object.entries(mediaLibraryEntries).length > 0) {
				return mediaLibraryEntries.flat(1)
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
