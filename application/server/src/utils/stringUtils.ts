import { Constants } from "../config";

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


