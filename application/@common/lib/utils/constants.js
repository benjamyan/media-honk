"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeExtensions = exports.excludeExtensions = exports.videoExtensions = exports.imageExtensions = exports.audioExtensions = exports.excludeName = exports.includeName = exports.reSpacers = exports.reTrailing = exports.reGlyphs = void 0;
// const reUpper = /([A-Z])/g;
// checks for nonsense left over in the title like names, addresses, etc.
// const reSuperfluous = /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|((\s|\.)?([a-z]+)scr|rip|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi;
exports.reGlyphs = /(?!([a-z\d]))./gi; // /(?!([a-z\d\s]))./gi;
exports.reTrailing = /((\_+)$|(\s+)$)/gim;
exports.reSpacers = /([\_]{2,})/gim;
exports.includeName = [];
exports.excludeName = [];
exports.audioExtensions = ['mp3', 'wma'];
exports.imageExtensions = ['jpg', 'png', 'jpeg', 'bmp'];
exports.videoExtensions = ['mov', 'avi', 'mp4'];
exports.excludeExtensions = ['txt', 'nfo', 'DS_Store', 'ini'];
exports.includeExtensions = [...exports.audioExtensions, ...exports.imageExtensions, ...exports.videoExtensions];
//# sourceMappingURL=constants.js.map