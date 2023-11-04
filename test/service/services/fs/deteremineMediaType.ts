import { default as Path } from 'path';
import { Constants } from "../../config";
import { StoredMediaTypes } from "../../types/MediaProperties";

/**
 * @function deteremineStoredMediaType A helper function to get the media type from a specified directory based on its content
 * @param dirContent All files within the media directory _including_ extension
 * @returns A string based on {@link StoredMediaTypes} 
 */
export const deteremineStoredMediaType = (dirContent: string[]): StoredMediaTypes => {
    const majorityFileType: Record<string, number> = {};
    let currentFileExt: string;

    /** Reduce the file list, maintiain a counter of the individual files matching a specific extension */
    dirContent.reduce((fileExtCount, file, i, arr)=> {
        currentFileExt = Path.extname(file).replace('.', ''); 
        
        if (Constants.audioExtensions.includes(currentFileExt)) {
            fileExtCount.audio = fileExtCount.audio + 1;
        } else if (Constants.videoExtensions.includes(currentFileExt)) {
            fileExtCount.video = fileExtCount.video + 1;
        } else if (Constants.imageExtensions.includes(currentFileExt)) {
            fileExtCount.image = fileExtCount.image + 1;
        }
        
        if (i == arr.length - 1) {
            const fileCount = fileExtCount.audio + fileExtCount.video + fileExtCount.image;
            /** It is possible that there is a single cover image present, 
             * but can still match the length of a directory containing a single 
             * media or audio file. Test for audio and video _first_
             * */
            for (const extType of Object.entries(fileExtCount)) {
                if (extType[1] >= (fileCount / 3)) {
                    majorityFileType[extType[0]] = extType[1];
                    break;
                }
            }
        }
        return fileExtCount
    }, { video: 0, audio: 0, image: 0 })
    
    switch(Object.keys(majorityFileType)[0]) {
        case 'video': {
            if (majorityFileType.video > 1) {
                return 'VS'
            }
            return 'VU'
        }
        case 'image': {
            if (majorityFileType.image > 1) {
                return 'IS'
            }
            return 'IU'
        }
        case 'audio': {
            if (majorityFileType.audio > 1) {
                return 'AS'
            }
            return 'AU'
        }
        default: {
            return 'X';
        }
    }
    
}
