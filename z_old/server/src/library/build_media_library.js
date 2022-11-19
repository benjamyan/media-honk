const CONFIG = require('../hidden_configs');
// const OS = require('os');
// const Fs = require('fs');
const Fsp = require('fs').promises;
const { resolve } = require('path');
const yaml = require('yaml')
// const path = require('path');

async function getFiles(dir) {
	const dirents = await Fsp.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(dirents.map((dirent) => {
		const res = resolve(dir, dirent.name);
		if (dirent.isDirectory() && dirent.name !== 'image') {
			return getFiles(res)
		}
		return res;
	}));
	return Array.prototype.concat(...files);
}

module.exports = async function getLibrary(req, res, next) {
	const x = await getFiles(CONFIG.mediaPath.video)
	console.log(x)
	// const x = Fs.readdirSync(CONFIG.mediaPath.video, {}, function(err, result) {
	// 	if (!!err) {
	// 		console.log(err)
	// 	}
	// 	console.log(result)
	// })
	// console.log(x)
}