// const reUpper = /([A-Z])/g;
// checks for nonsense left over in the title like names, addresses, etc.
// const reSuperfluous = /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|((\s|\.)?([a-z]+)scr|rip|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi;
/** Will capture the standard punctuation we might want to preserve */
export const rePunctuation = /('|,)/gi;
export const reNumber = /^\d+$/gi;
export const reTrackNumber = /^\d{1,2}\s/gis;
export const reGlyphs = /(?!([a-z\d]))./gi; // /(?!([a-z\d\s]))./gi;
export const reTrailing = /((\_+)$|(\s+)$)/gim;
export const reSpacers = /([\_]{2,})/gim;

export const selectiveExclude = [
    'the', 'and', 'of', 'in', 'or', 'to', 'ft', 'feat', 'feat.'
];

export const includeName: string[] = [];
export const excludeName: string[] = [];

export const audioExtensions: string[] = ['mp3', 'wma'];
export const imageExtensions: string[] = ['jpg','png','jpeg','bmp'];
export const videoExtensions: string[] = ['mov','avi','mp4'];
export const subtitleExtensions: string[] = ['srt'];

export const excludeExtensions: string[] = ['txt', 'nfo','DS_Store','ini'];
export const includeExtensions: string[] = [ ...audioExtensions, ...imageExtensions, ...videoExtensions ];

export const permittedMediaTypes: string[] = ['album','gallery','movie','series','singles'];
// export const databaseMediaTypes: string[] = ['VU','VS','AU','AS','IU','IS'];
export const databaseMediaTypes: string[] = ['V','A','I','X'];
