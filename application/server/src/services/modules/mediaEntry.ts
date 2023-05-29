import { permittedMediaTypes } from "../../config/constants";
import { parseStringForError } from "../../helpers/stringUtils";
// import { getMediaTypeFromFileList } from "./fileSystem";

export const mapDeprecatedToValidKeys = ({
    mediaEntry,
    dirPath
}: {
    mediaEntry: { actors?: string | string[]; } & Partial<HasValidMediaPropertiesType>;
    dirPath: string;
})=> {
    const newMediaEntry = { ...mediaEntry };
    if (mediaEntry.actors) {
        if (Array.isArray(mediaEntry.actors)) {
            newMediaEntry.artists = [...mediaEntry.actors]
        } else {
            newMediaEntry.artists = [mediaEntry.actors]
        }
        delete newMediaEntry.actors;
    }
    
    return { ...newMediaEntry } as Honk.Media.BasicLibraryEntry
}

type HasValidMediaPropertiesType = Honk.Media.BaselineMediaProperties & Partial<Honk.Media.MediaPropertyDefition>;
export const hasValidMediaProperties = (mediaEntry: HasValidMediaPropertiesType): boolean | Error => {
    let currentProperty: HasValidMediaPropertiesType[keyof HasValidMediaPropertiesType] = null!;

    for (const property in mediaEntry) {
        currentProperty = mediaEntry[property as keyof typeof mediaEntry];
        switch(property) {
            case 'type': 
            case 'title': {
                if (!currentProperty || currentProperty.length === 0) {
                    return new Error(`Required property not provided: ${property}`)
                }

                if (parseStringForError(currentProperty as string) instanceof Error) {
                    return new Error(`Invalid typeof property provided: ${property}`)
                }

                if (property === 'type' && !permittedMediaTypes.includes(currentProperty as string)) {
                    return new Error(`Expected one of permitted types in ${property}, but got: ${currentProperty}`)
                }

                break;
            }
            case '_guid':
            case 'subtitle': {
                if (!currentProperty || parseStringForError(currentProperty as string) === true) {
                    break;
                }
                return new Error(`Invalid property: ${property}`);
            }
            case 'artists':
            case 'categories': {
                if (!currentProperty || Array.isArray(currentProperty)) {
                    break;
                }
                return new Error(`Expected undefined or array in ${property}, but got: ${typeof currentProperty}`);
            }
            default: {
                /** its got bad wordz HAUHAUAHHAUAHAU HAAA */
                return new Error(`Unknown property found: ${property}`)
            }
        }
    }
    return true;
}