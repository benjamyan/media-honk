import { constants } from "mediahonk";

interface StandardizeStringFormatProps {
    /** Strings that should be removed from the given title if present */
    removeStrings?: string[];
    /** Will cast words to uppercase that are not "common" ie "the", "of", "and", etc. unless the string starts with them */
    selectiveUppercase?: boolean;
}

/** 
 * @function standardizeTitleFormat is meant to standardize how we present our titles and subtitles 
 * @argument props.title is the supplied string we need to format
 * @argument props.options are the options we can pass in (see object doc) 
 * 
 * - By default it will remove any string that is found under our @link deps/common lib `selectiveExclude` array 
 */
export const standardizeTitleFormat = (givenString: string, options?: StandardizeStringFormatProps): string => {
    // const { givenString, options } = props;
    let newTitle = givenString;

    if (constants.reNumber.test(newTitle)) {
        /** If the title is only a number, return the title as-is */
        return newTitle;
    }
    if (constants.rePunctuation.test(newTitle)) {
        /** Test for breaking punctuation and remove */
        newTitle = newTitle.replace(constants.rePunctuation, '')
    }
    if (constants.reTrailing.test(newTitle)) {
        /** Remove excessive/superfluous spacing and underscores */
        newTitle = newTitle.replace(constants.reTrailing, ' ')
    }
    if (constants.reGlyphs.test(newTitle)) {
        /** Test and replace glyphs excluding underscores  */
        newTitle = newTitle.replace(constants.reGlyphs, '_')
    }
    if (options?.removeStrings !== undefined && options.removeStrings.length > 0) {
        /** Test if an offending string is in the title */
        options.removeStrings.forEach((remove)=>{
            /** alter the string to be removed to match UNIX filename parameters */
            remove = (
                remove
                    .toLowerCase()
                    .replace(constants.rePunctuation, '')
                    .replace(constants.reTrailing, ' ')
                    .replace(constants.reGlyphs, '_')
            );
            if (newTitle.includes(remove)) {
                /** If it exists, remove it and replace w nothing */
                newTitle = newTitle.replace(remove, '');
            }
        })
    }

    /** Start formatting the string for return and display */
    newTitle = (
        newTitle
            .trim()
            .replace(constants.reTrailing, ' ')
            .replace(constants.reGlyphs, ' ')
            .replace(constants.reTrackNumber, '')
            .trim()
    );
    
    if (options?.selectiveUppercase) {
        newTitle = (
            newTitle
                .split(' ')
                .map((word, i, arr)=> {
                    if (i === arr.length - 1 && constants.selectiveExclude.includes(word)) {
                        /** If this is the last word present and its in our exclusion list, just remove it */
                        return undefined
                    }
                    if (i === 0 || !constants.selectiveExclude.includes(word)) {
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