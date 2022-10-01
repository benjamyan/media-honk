// type uuidChar = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9';
// type uuidSection = `${uuidChar}${uuidChar}${uuidChar}${uuidChar}`

export namespace Media {
    export type MediaTypes = 'series' | 'movie' | 'gallery' | 'singles' | 'podcast' | 'album';
    export interface BaselineMediaProperties {
        type: MediaTypes;
        title: string;
        subtitle?: string;
        artists?: string[];
        categories?: string[] 
    }
    
    export interface BasicLibraryEntry {
        uuid: string;

        baseUrl: string;
        mediaUrl: string | Record<string, string>;
        audioUrl?: string | Record<string, string>;
        galleryUrl?: string;
        coverUrl?: string;

        mediaSource?: string;
        mediaType: MediaTypes | null;
        title: string;
        subtitle?: string;
        actors: string[];
        categories: string[];
    }
}
