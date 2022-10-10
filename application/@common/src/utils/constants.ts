// const reUpper = /([A-Z])/g;
// checks for nonsense left over in the title like names, addresses, etc.
// const reSuperfluous = /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|((\s|\.)?([a-z]+)scr|rip|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi;
export const reGlyphs = /(?!([a-z\d]))./gi; // /(?!([a-z\d\s]))./gi;
export const reTrailing = /((\_+)$|(\s+)$)/gim;
export const reSpacers = /([\_]{2,})/gim;

export const includeName: string[] = [];
export const excludeName: string[] = [];

export const audioExtensions: string[] = ['mp3', 'wma'];
export const imageExtensions: string[] = ['jpg','png','jpeg','bmp'];
export const videoExtensions: string[] = ['mov','avi','mp4'];

export const excludeExtensions: string[] = ['txt', 'nfo','DS_Store','ini'];
export const includeExtensions: string[] = [ ...audioExtensions, ...imageExtensions, ...videoExtensions ];