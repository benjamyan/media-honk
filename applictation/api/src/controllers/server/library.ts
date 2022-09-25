import { Request, Response } from 'express';
import { promises as Fsp } from 'node:fs';
import * as Path from 'node:path';
import * as Yaml from 'yaml';

import { Honk, Media } from '../../types';

type LibEntryReturnType = Omit<Media.BasicLibraryEntry, 'uuid' | 'mediaSource'>;

const factory_fileEntry = async (entry: string): Promise<LibEntryReturnType| undefined> => {
	try {
		const entryChild = entry.split('/');
		const entryName = entryChild[entryChild.length - 1];
		const libEntry: LibEntryReturnType = {
			mediaType: undefined,
			title: entryName.split('.')[0],
			videoUrl: entry,
			galleryUrl: undefined,
			coverImageUrl: undefined,
			actors: [],
			categories: []
		};
		if (libEntry.title.length === 0) {
			libEntry.title = entry
		}
		return libEntry
	} catch (err) {
		console.log(err)
		return undefined
	}
};
const factory_directoryEntry = async (entry: string): Promise<LibEntryReturnType| undefined> => {
	const entryChild: any = (
		await Fsp.readdir(entry)
			.then(children=> children)
			.catch(err=> console.log(err))
	);
	if (Array.isArray(entryChild)) {
		const libEntry: LibEntryReturnType = {
			mediaType: undefined,
			title: '',
			videoUrl: '',
			galleryUrl: undefined,
			coverImageUrl: undefined,
			actors: [],
			categories: []
		};
	
		await Promise.all(entryChild.map(async (child: string): Promise<void> => {
			if (child === 'image') {
				libEntry.galleryUrl = Path.resolve(entry, child) as string;
				return
			}
			if (child === 'properties.yaml') {
				const file = await Fsp.readFile(Path.resolve(entry, child), 'utf8');
				const props = Yaml.parse(file)
				if (!!props) {
					if (props.title !== undefined) {
						libEntry.title = props.title
					}
					if (props.actors !== undefined && Array.isArray(props.actors)) {
						libEntry.actors = [...props.actors]
					}
					if (props.categories !== undefined && Array.isArray(props.categories)) {
						libEntry.categories = [...props.categories]
					}
				}
				return 
			}
			if (child.endsWith('.jpg') || child.endsWith('.png')) {
				libEntry.coverImageUrl = Path.resolve(entry, child)
				return 
			}
			if (child.indexOf('.mp4') > -1) {
				libEntry.videoUrl = Path.resolve(entry, child)
				if (child.split('.mp4')[0].endsWith('LR')) {
					libEntry.mediaType = 'VR_180_LR'
				}
				return 
			}
		}));

		if (libEntry.title.length === 0) {
			libEntry.title = entry
		}
	
		return libEntry
	} else {
		return undefined
	}
	
};

const parseFilesForLibrary = async (source: string, dir: string): Promise<Media.BasicLibraryEntry[]> => {
	const dirents = await Fsp.readdir(dir, { withFileTypes: true });
	const accumulator: Media.BasicLibraryEntry[] = [];
	await Promise.all(dirents.map(async (dirent, index) => {
		try {
			const res = Path.resolve(dir, dirent.name);
			let newEntry;
			if (res.endsWith('.mp4')) {
				newEntry = await factory_fileEntry(res);
			} else {
				newEntry = await factory_directoryEntry(res);
			}
			if (newEntry === undefined || newEntry.title === undefined || newEntry.videoUrl === undefined) {
				throw new Error('Failure to compile on ' + dirent.name)
			}
			accumulator.push({
				mediaSource: source,
				uuid: `0000-0000-000${index}`,
				...newEntry
			})
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
