import { Request, Response } from 'express';
import { default as Fs, Dirent, promises as Fsp } from 'node:fs';
import * as Path from 'node:path';
import * as Yaml from 'yaml';

// import { Honk } from 'mediahonk/src';
import { Serve, Honk } from '../../types';
import { constants } from '../../utils';

type LibEntryReturnType = Omit<Honk.BasicLibraryEntry, 'uuid' | 'mediaSource'>;

// const factory_multiEntryDirectory = async (directoryContent: string[], libEntry: Honk.BasicLibraryEntry)=> {
// 	const filesToProcess = [...directoryContent];

// 	await Promise.all(directoryContent.map( async (dirFile: string): Promise<void> => {
// 		const fileExt = dirFile.split('.').slice(-1)[0];
// 		const fileName = dirFile.split('.')[0];
		
// 		if (libEntry.coverUrl === undefined && constants.imageExtensions.includes(fileExt)) {
// 			libEntry.coverUrl = dirFile;
// 		}

// 		switch(libEntry.type) {
// 			case 'movie': {
// 				if (constants.videoExtensions.includes(fileExt)) {
// 					libEntry.mediaUrl[fileName] = dirFile;
// 				}
// 				if (constants.audioExtensions.includes(fileExt)) {
// 					if (libEntry.audioUrl === undefined) {
// 						libEntry.audioUrl = {};
// 					}
// 					libEntry.audioUrl[fileName] = dirFile;
// 				}
// 				break
// 			}
// 			case 'series': {
// 				let newFileName = dirFile;
// 				if (constants.videoExtensions.includes(fileExt)) {
// 					// if (child.indexOf(libEntry.title.toLowerCase()) > -1) {
// 					// 	newFileName = newFileName.split(libEntry.title.toLowerCase())[1]
// 					// }
// 					libEntry.mediaUrl[fileName] = dirFile;
// 				}
// 				break
// 			}
// 			case 'album': {
// 				if (constants.audioExtensions.includes(fileExt)) {
// 					libEntry.mediaUrl[fileName.split('.')[0]] = dirFile;
// 				}
// 				break
// 			}
// 			case 'singles': {
// 				if (constants.audioExtensions.includes(fileExt)) {
// 					libEntry.mediaUrl[fileName.split('.')[0]] = dirFile;
// 				}
// 				break
// 			}
// 			case 'gallery': {
// 				if (constants.imageExtensions.includes(fileExt)) {
// 					libEntry.mediaUrl[fileName.split('.')[0]] = dirFile;
// 				}
// 				break
// 			}
// 			default: {
// 				//
// 			}
// 		}



// 	}));

// 	return libEntry
// }
// const factory_singleEntryDirectory = async (dirProps: Honk.BaselineMediaProperties)=> {

// }
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
			audioUrl: undefined,
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
				if (libEntry.type === 'gallery') {
					libEntry.mediaUrl[fileName] = dirFile;
				}
			}

			if (constants.videoExtensions.includes(fileExt)) {
				if (libEntry.type === 'series') {
					libEntry.mediaUrl[fileName] = dirFile;
				} else {
					libEntry.mediaUrl[fileName] = dirFile;
				}
			}

			if (constants.audioExtensions.includes(fileExt)) {
				if (libEntry.type === 'album' || libEntry.type === 'singles') {
					libEntry.mediaUrl[fileName] = dirFile;
				}
				// if (libEntry.audioUrl === undefined) {
				// 	libEntry.audioUrl = {};
				// }
				// libEntry.audioUrl[fileName] = dirFile;
			}
			
		}));
		
		return !exitMediaProcess ? libEntry : undefined
	} else {
		return undefined
	}
	
};

const parseFilesForLibrary = async (source: string, dir: string): Promise<Omit<Honk.BasicLibraryEntry, 'uuid'>[]> => {
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
						mediaSource: source,
						...entryAttempt
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

export async function getLibrary(_req: Serve.Request, res: Serve.Response): Promise<void> {
	try {
		if (!!res.locals.userMediaPaths) {
			const mediaLibraryEntries = await Promise.all(
				Object.entries(res.locals.userMediaPaths as Record<string, string>)
					.map( async (path: [string, string])=> {
						const entriesFromPath = await parseFilesForLibrary(path[0], path[1]);
						return entriesFromPath
					})
					.filter(Boolean)
					.flat(1)
			);
			if (Object.entries(mediaLibraryEntries).length > 0) {
				const temp = (
					mediaLibraryEntries
						.flat(1)
						.map(
							(entry, index)=>({
								...entry,
								uuid: `0000-000${index}`
							})
						)
				);
				res.statusCode = 200;
				res.set({
					'Access-Control-Allow-Origin': 'http://192.168.0.11'
				})
				console.log(temp)
				res.send(temp)
			} else {
				res.statusCode = 204;
				res.send('Did not return any entries')
			}
		} else {
			throw new Error('Invalid path')
		}
	} catch (err) {
		console.log(err)
		res.sendStatus(500)
	}
}
