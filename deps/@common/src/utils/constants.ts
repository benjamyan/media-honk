// const reUpper = /([A-Z])/g;
// checks for nonsense left over in the title like names, addresses, etc.
// const reSuperfluous = /(((\d{3,4})p)|(x\d{3})|([a-z]{1,3}3)|((\s|\.)?([a-z]+)scr|rip|hc|aac|axxo|xvid)|(\d{3,4}x\d{3,4})).*/gi;

/** Matches one or more white spaces */
export const reSpace = /\s+/gi;
/** Will test and capture a string that only contains numbers */
export const reNumber = /^\d+$/gi;
/** Will capture everything besides a-z and numbers */
export const reGlyphs = /(?!([a-z\d]))./gi; // /(?!([a-z\d\s]))./gi;
/** Will capture everything besides a-z, numbers, spaces, and underscores */
export const reGlyphInclusive = /(?!([a-z\d\s_]))./gi; // /(?!([a-z\d\s]))./gi;
/** Captures trailing whitespaces and underscores, newlines, and entries that contain more than one space or underscore between characters */
export const reTrailing = /((\_{2,})|(\s{2,})|(\_+)$|(\s+)$)/gim; // /((\_+)$|(\s+)$)/gim;
/** Captures two or more underscores */
export const reSpacers = /([\_]{2,})/gim;
/** Capture underscores */
export const reUnderscore = /(\_+)/gi;
/** Will capture the standard punctuation we might want to preserve */
export const rePunctuation = /('|,)/gi;
/** Audio file specific - will match to the beginning track number */
export const reTrackNumber = /^\d{1,2}\s/gis;

// export const re = {}

export const includeName: string[] = [];
export const excludeName: string[] = [];

export const selectiveExclude: string[] = [
    'the', 'and', 'of', 'in', 'or', 'to', 'ft', 'feat', 'feat.'
]

export const coverUrlKeyName: string = '__COVER__';
export const coverImageOverrideName: string = 'cover';

export const audioExtensions: string[] = ['mp3', 'wma'];
export const imageExtensions: string[] = ['jpg','png','jpeg','bmp','svg'];
export const videoExtensions: string[] = ['mov','avi','mp4'];

export const excludeExtensions: string[] = ['txt', 'nfo','DS_Store','ini'];
export const mediaExtensions: string[] = [ ...audioExtensions, ...imageExtensions, ...videoExtensions ];
