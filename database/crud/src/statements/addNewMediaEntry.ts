import { Honk } from 'mediahonk';
import { Database } from '..';

/** These functions would be a good usecase for generators */
export const addNewMediaEntry = async (data: Honk.Media.BasicLibraryEntry): Promise<true | Error> => {
    try {
        
        const { entries, categories, artists } = data;
        if (entries.length === 0) {
            throw new Error('Media entries cannot be empty')
        }
        
        const mediaEntryArguments = [
            data.sourceUrl,
            data.relativeUrl,
            data.title,
            data.subtitle,
            data.coverImageUri,
            JSON.stringify(entries),
            (
                artists === undefined || !Array.isArray(artists) || artists.length === 0 
                    ? null 
                    : artists.join(',')
            ),
            (
                categories === undefined || !Array.isArray(categories) || categories.length === 0 
                    ? null 
                    : categories.join(',')
            )
        ];
        const addMediaBundle = await (
            Database
                .query(
                    `CALL media_bundle_entry_set_relationships(?,?,?,?,?,?,?,?)`,
                    mediaEntryArguments
                )
                .then(()=> {
                    return true;
                })
                .catch((err)=>{
                    console.log(err)
                    return err
                })
        );
        if (addMediaBundle === undefined || addMediaBundle !== true) {
            throw new Error('Failed to add media bundle entry to DB')
        }
        
        return true;
        
    } catch (err) {
        console.log(data)
        console.error(err)
        return err instanceof Error ? err : new Error(`Unhandled exception`);
    }
}
