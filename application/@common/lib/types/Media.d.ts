export declare namespace Honk {
    type MediaTypes = 'series' | 'movie' | 'gallery' | 'singles' | 'podcast' | 'album';
    interface BaselineMediaProperties {
        type: MediaTypes;
        title: string;
        subtitle?: string;
        artists?: string[];
        categories?: string[];
    }
    interface BasicLibraryEntry {
        uuid: string;
        baseUrl: string;
        mediaUrl: Record<string, string>;
        audioUrl: Record<string, string> | undefined;
        coverUrl: string | undefined;
        mediaSource: string | undefined;
        type: MediaTypes;
        title: string;
        subtitle?: string;
        artists: string[];
        categories: string[];
    }
}
