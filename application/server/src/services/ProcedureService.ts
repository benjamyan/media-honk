import { MediaHonkServerBase } from "../_Base";

export class ProcedureService extends MediaHonkServerBase {
    constructor() {
        super();

    }

    public async insertMediaEntry(mediaEntry: Honk.Media.BasicLibraryEntry, overwrite?: boolean) {
        console.log(mediaEntry)
        // console.log(mediaEntry.title)
        // console.log(mediaEntry.entries)
        try {
            if (mediaEntry.coverUrl) {
                // console.log(mediaEntry.coverUrl)
                // console.log(this.db)
                this.db
                    .insert({
                        file_url: mediaEntry.coverUrl,
                        source_id: 1
                    })
                    .into('covers')
                    .onConflict('file_url')
                    .ignore()
                    .catch(err=> {
                        console.log(err)
                    })
            }
            if (mediaEntry.artists) {
                // this.db
                //     .insert({
                //         artist_name: mediaEntry.coverUrl,
                //     })
                //     .into('covers')
                //     .onConflict('file_url')
                //     .ignore()
                //     .catch(err=> {
                //         console.log(err)
                //     })
            }
        } catch (err) {
            console.log(err);
        }
    }

}