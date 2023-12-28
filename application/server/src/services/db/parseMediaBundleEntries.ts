import { Constants } from "../../config";
import { ConfiguredMediaAssetProperties, ResolvedMediaAssetProperties } from "../../types/MediaProperties";
import { standardizeTitleFormat } from "../../utils/asset.utils";

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