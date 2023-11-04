import { AcceptedMediaTypes, StoredMediaTypes } from "../../types/MediaProperties";

export const convertToStoredMediaType = (mediaType: AcceptedMediaTypes)=> {
    let resolvedMediaType: StoredMediaTypes; 

    switch (mediaType) {
        case 'album': {
            resolvedMediaType = 'AS';
            break;
        }
        case 'singles': {
            resolvedMediaType = 'AU';
            break;
        }
        case 'movie': {
            resolvedMediaType = 'VU';
            break;
        }
        case 'series': {
            resolvedMediaType = 'VS';
            break;
        }
        case 'gallery': {
            resolvedMediaType = 'IS';
            break;
        }
        default: {
            resolvedMediaType = 'X';
        }
    }

    return resolvedMediaType;
}