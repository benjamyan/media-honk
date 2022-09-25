export namespace Media {
    export interface BasicLibraryEntry {
        mediaSource?: string;
        mediaType?: string;
        uuid: string;
        title: string,
        videoUrl: string,
        galleryUrl?: string,
        coverImageUrl?: string,
        actors: string[],
        categories: string[]
    }
}
