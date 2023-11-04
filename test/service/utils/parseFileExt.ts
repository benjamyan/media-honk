import { imageExtensions, videoExtensions, audioExtensions } from "../config/constants"

export const getMediaExtFromFilename = (filename: string)=> {
    if (typeof filename != 'string') {
        throw new Error('BAD_FILENAME_TYPE')
    } else if (imageExtensions.includes(filename.split('.').at(-1)!)) {
        return 'IMAGE'
    } else if (videoExtensions.includes(filename.split('.').at(-1)!)) {
        return 'VIDEO'
    } else if (audioExtensions.includes(filename.split('.').at(-1)!)) {
        return 'AUDIO'
    }
    return 'INVALID'
}