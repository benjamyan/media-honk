export namespace Honk {
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
        mediaUrl: Record<string, string>;
        audioUrl: Record<string, string> | undefined;
        // galleryUrl: string | undefined;
        coverUrl: string | undefined;

        mediaSource: string | undefined;
        type: MediaTypes;
        title: string;
        subtitle?: string;
        artists: string[];
        categories: string[];
    }
}
