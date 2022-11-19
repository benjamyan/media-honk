const CONFIG = require('../../../hidden_configs');
// const OS = require('os');
// const Fs = require('fs');
const Fsp = require('fs').promises;
const { resolve } = require('path');
const resolvePath = resolve;
const yaml = require('yaml')
// const path = require('path');

const factory_libraryEntry = async (entry) => {
	const entryChild = await Fsp.readdir(entry).catch(err=> console.log(err));
	const libEntry = {
		title: undefined,
		videoUrl: undefined,
		galleryUrl: undefined,
		coverImageUrl: undefined,
		actors: [],
		categories: []
	};

	await Promise.all(entryChild.map(async (child) => {
		if (child === 'image') {
			libEntry.galleryUrl = resolvePath(entry, child);
			return 0
		}
		if (child === 'properties.yaml') {
			const file = await Fsp.readFile(resolvePath(entry, child), 'utf8');
			const props = yaml.parse(file)
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
			return 0
		}
		if (child === 'cover.jpg') {
			libEntry.coverImageUrl = resolvePath(entry, child)
			return 0
		}
		if (child.indexOf('.mp4') > -1) {
			libEntry.videoUrl = resolvePath(entry, child)
			return 0
		}
	}));

	return libEntry
}

async function getFiles(dir) {
	const dirents = await Fsp.readdir(dir, { withFileTypes: true });
	const accumulator = {};
	await Promise.all(dirents.map(async (dirent, index) => {
		try {
			const res = resolvePath(dir, dirent.name);
			const newEntry = await factory_libraryEntry(res);
			if (newEntry === undefined || newEntry.title === undefined || newEntry.videoUrl === undefined) {
				throw new Error('Failure to compile on ' + dirent.name)
			}
			accumulator[`0000-0000-000${index}`] = newEntry
			return 0
		} catch (err) {
			console.log(err)
			return 0
		}
	}));
	return accumulator
}

module.exports = async function getLibrary(req, res, next) {
	const x = await getFiles(CONFIG.mediaPath.video);
	res.send(x)
	// const x = Fs.readdirSync(CONFIG.mediaPath.video, {}, function(err, result) {
	// 	if (!!err) {
	// 		console.log(err)
	// 	}
	// 	console.log(result)
	// })
	// console.log(x)
}
