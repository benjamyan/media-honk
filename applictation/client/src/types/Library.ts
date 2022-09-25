export interface BaselineLibraryEntry {
    uuid: string;
    mediaSource: string | undefined;
    mediaType: string | undefined;
    title: string;
    videoUrl: string;
    galleryUrl: string | undefined,
    coverImageUrl: string | undefined,
    actors: string[],
    categories: string[]
}
