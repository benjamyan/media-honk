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
                // await this.db.Covers.insertCoverEntry(mediaEntry.coverUrl);
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