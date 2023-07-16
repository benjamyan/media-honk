import { Constants } from "../config";
import { AcceptedMediaTypes, ResolvedMediaAssetProperties, ConfiguredMediaAssetProperties, StoredMediaTypes, UniqueMediaDefinition } from "../types/MediaProperties";

export const formatMediaEntries = (entries: string[], pathname: string, properties: ConfiguredMediaAssetProperties): ResolvedMediaAssetProperties['entries'] => {
    let entryFile: string = null!,
        formattedEntries: ResolvedMediaAssetProperties['entries'] = [];
        
    for (let i = 0; i <= entries.length - 1; i++) {
        entryFile = (
            entries[i]
                .replace(pathname, '')
                .toLowerCase()
        );
        formattedEntries.push({
            index: i, 
            filename: entries[i], 
            title: standardizeTitleFormat(
                entryFile.indexOf('/') > -1
                    ? entryFile.split('/').at(-1) as string
                    : entryFile,
                {
                    removeStrings: [
                            properties.title.toLowerCase(),
                            Array.isArray(properties.artists)
                                ? properties.artists.map((artist)=>artist.toLowerCase())
                                : '',
                            ...Constants.includeExtensions
                        ]
                        .filter(Boolean)
                        .flat(1) as string[],
                    selectiveUppercase: true
                }
            )
        })
        if (formattedEntries[i].title.length === 0) {
            formattedEntries[i].title = `${properties.title} item ${String(i + 1)}`
        }
    }
    return formattedEntries
}

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
    
    return { ...newMediaEntry } as ConfiguredMediaAssetProperties // ResolvedMediaAssetProperties
}

type HasValidMediaPropertiesType = ConfiguredMediaAssetProperties & Partial<UniqueMediaDefinition>;
export const hasValidMediaProperties = (mediaEntry: ConfiguredMediaAssetProperties & Partial<UniqueMediaDefinition>): boolean | Error => {
    let currentProperty: HasValidMediaPropertiesType[keyof HasValidMediaPropertiesType] = null!;

    for (const property in mediaEntry) {
        currentProperty = mediaEntry[property as keyof typeof mediaEntry];
        switch(property) {
            case 'type': 
            case 'title': {
                if (!currentProperty || currentProperty.length === 0) {
                    return new Error(`Required property not provided: ${property}`)
                }

                if (typeof(currentProperty) !== 'string') {
                    return new Error(`Invalid typeof property provided: ${property}`)
                }

                if (property === 'type' && !Constants.permittedMediaTypes.includes(currentProperty as string)) {
                    return new Error(`Expected one of permitted types in ${property}, but got: ${currentProperty}`)
                }

                break;
            }
            case '_guid':
            case 'subtitle': {
                if (!currentProperty || typeof(currentProperty) == 'string') {
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

export interface StandardizeStringFormatProps {
    /** Strings that should be removed from the given title if present */
    removeStrings?: string[];
    /** Will cast words to uppercase that are not "common" ie "the", "of", "and", etc. unless the string starts with them */
    selectiveUppercase?: boolean;
}
export const standardizeTitleFormat = (givenString: string, options?: StandardizeStringFormatProps)=> {
    let newTitle = givenString;
    
    if (Constants.reNumber.test(newTitle)) {
        /** If the title is only a number, return the title as-is */
        return newTitle;
    }
    if (Constants.rePunctuation.test(newTitle)) {
        /** Test for breaking punctuation and remove */
        newTitle = newTitle.replace(Constants.rePunctuation, '')
    }
    if (Constants.reTrailing.test(newTitle)) {
        /** Remove excessive/superfluous spacing and underscores */
        newTitle = newTitle.replace(Constants.reTrailing, ' ')
    }
    if (Constants.reGlyphs.test(newTitle)) {
        /** Test and replace glyphs excluding underscores  */
        newTitle = newTitle.replace(Constants.reGlyphs, '_')
    }

    if (options?.removeStrings !== undefined && options.removeStrings.length > 0) {
        /** Test if an offending string is in the title */
        options.removeStrings.forEach((remove)=>{
            /** alter the string to be removed to match UNIX filename parameters */
            remove = (
                remove
                    .toLowerCase()
                    .replace(Constants.rePunctuation, '')
                    .replace(Constants.reTrailing, ' ')
                    .replace(Constants.reGlyphs, '_')
            );
            if (newTitle.includes(remove)) {
                /** If it exists, remove it and replace w nothing */
                newTitle = newTitle.replaceAll(remove, '');
            }
        })
    }

    /** Start formatting the string for return and display */
    newTitle = (
        newTitle
            .trim()
            .replace(Constants.reTrailing, ' ')
            .replace(Constants.reGlyphs, ' ')
            .replace(Constants.reTrackNumber, '')
            .trim()
    );
    
    if (options?.selectiveUppercase) {
        newTitle = (
            newTitle
                .split(' ')
                .map((word, i, arr)=> {
                    if (i === arr.length - 1 && Constants.selectiveExclude.includes(word)) {
                        /** If this is the last word present and its in our exclusion list, just remove it */
                        return undefined
                    }
                    if (i === 0 || !Constants.selectiveExclude.includes(word)) {
                        word = word.replace(/^\w/, c => c.toUpperCase())
                    }
                    return word
                })
                .filter(Boolean)
                .join(' ')
        )
    }
    
    return newTitle
}
