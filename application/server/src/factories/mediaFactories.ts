import { Constants } from "../config";
import { StringUtil } from "../utils";

export const formatMediaEntries = (entries: string[], pathname: string, properties: Honk.Media.BaselineMediaProperties): Honk.Media.BasicLibraryEntry['entries'] => {
    let entryFile: string = null!,
        formattedEntries: Honk.Media.BasicLibraryEntry['entries'] = [];

    for (let i = 0; i < entries.length - 1; i++) {
        entryFile = (
            entries[i]
                .replace(pathname, '')
                .toLowerCase()
        );
        formattedEntries.push({
            index: i, 
            filename: entries[i], 
            title: StringUtil.standardizeTitleFormat(
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
