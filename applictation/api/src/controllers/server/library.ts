import { Request, Response } from 'express';
import { default as Fs, Dirent, promises as Fsp } from 'node:fs';
import * as Path from 'node:path';
import * as Yaml from 'yaml';

import { Honk, Media } from '../../types';
import { Constants } from '../../utils';

type LibEntryReturnType = Omit<Media.BasicLibraryEntry, 'uuid' | 'mediaSource'>;

const factory_multiEntryDirectory = async ()=> {

}
const factory_singleEntryDirectory = async ()=> {

}
const factory_libEntryDefinition = (propsContent: Media.BaselineMediaProperties)=> ({

})
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
		const { title, subtitle, type, actors, categories } = Yaml.parse(file);
		const libEntry: LibEntryReturnType = {
			mediaUrl: type === 'movie' ? '' : {},
			baseUrl: entry + '/',
			audioUrl: undefined,
			galleryUrl: undefined,
			coverUrl: undefined,
			mediaType: type,
			title,
			subtitle,
			actors,
			categories
		};
		directoryContent.splice(yamlFileIndex, 1);
		
		await Promise.all(directoryContent.map( async (child: string): Promise<void> => {
			const fileExt = child.split('.').slice(-1)[0];
			
			if (libEntry.coverUrl === undefined && Constants.imageExtensions.includes(fileExt)) {
				libEntry.coverUrl = child;
			}

			switch(libEntry.mediaType) {
				case 'movie': {
					if (Constants.videoExtensions.includes(fileExt)) {
						libEntry.mediaUrl = child;
					}
					if (Constants.audioExtensions.includes(fileExt)) {
						libEntry.audioUrl = child;
					}
					break
				}
				case 'series': {
					let newFileName = child;
					if (Constants.videoExtensions.includes(fileExt)) {
						// if (child.indexOf(libEntry.title.toLowerCase()) > -1) {
						// 	newFileName = newFileName.split(libEntry.title.toLowerCase())[1]
						// }
						/// @ts-ignore-error
						libEntry.mediaUrl[child.split('.')[0]] = child;
					}
					break
				}
				case 'album': {
					if (Constants.audioExtensions.includes(fileExt)) {
						/// @ts-ignore-error
						libEntry.mediaUrl[child.split('.')[0]] = child;
					}
					break
				}
				case 'singles': {
					if (Constants.audioExtensions.includes(fileExt)) {
						/// @ts-ignore-error
						libEntry.mediaUrl[child.split('.')[0]] = child;
					}
					break
				}
				case 'gallery': {
					if (Constants.imageExtensions.includes(fileExt)) {
						/// @ts-ignore-error
						libEntry.mediaUrl[child.split('.')[0]] = child;
					}
					break
				}
				default: {
					//
				}
			}
		}));
		
		return !exitMediaProcess ? libEntry : undefined
	} else {
		return undefined
	}
	
};

const parseFilesForLibrary = async (source: string, dir: string): Promise<Media.BasicLibraryEntry[]> => {
	const dirents = await Fsp.readdir(dir, { withFileTypes: true });
	let accumulator: Media.BasicLibraryEntry[] = [];

	await Promise.all(dirents.map(async (dirent, index, dirents) => {
		try {
			const res = Path.resolve(dir, dirent.name);
			let childEntries: any,
				entryAttempt: LibEntryReturnType | undefined;

			if (Fs.existsSync(Path.join(res, 'properties.yaml'))) {
				entryAttempt = await processDirectoryEntry(res);
				if (entryAttempt !== undefined) {
					accumulator.push({
						mediaSource: source,
						uuid: `0000-0000-000${index}`,
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

export async function getLibrary(_req: Honk.Request, res: Honk.Response): Promise<void> {
	try {
		if (!!res.locals.userMediaPaths) {
			const mediaLibraryEntries = await Promise.all(
				Object.entries(res.locals.userMediaPaths as Record<string, string>)
					.map( async (path: [string, string])=> {
						const entriesFromPath = await parseFilesForLibrary(path[0], path[1]);
						return entriesFromPath
					})
					.filter(Boolean)
			);
			if (Object.entries(mediaLibraryEntries).length > 0) {
				res.statusCode = 200;
				res.set({
					'Access-Control-Allow-Origin': 'http://192.168.0.11'
				})
				res.send(mediaLibraryEntries.flat(1))
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
