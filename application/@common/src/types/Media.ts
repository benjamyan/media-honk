export namespace Honk {
    export type MediaTypes = 'series' | 'movie' | 'gallery' | 'singles' | 'podcast' | 'album';
    export interface Configuration {
        dns: string;
        server: string;
        domain: string;
        dev_http_port: number;
        dev_https_port: number;
        use_https: boolean;
        allowedOrigins: string[];
        userMediaPaths: Record<string | number, string>;
        users: string[];
        admins: string[];
    }
    export interface BaselineMediaProperties {
        type: MediaTypes;
        title: string;
        subtitle?: string;
        artists?: string[];
        categories?: string[];
    }
    // export type LibraryEntryMedia = {}
    export interface BasicLibraryEntry {
        uuid: string;
        /** The absolute URL relative to our API */
        baseUrl: string;
        /** Object where `key` is the media title to be displayed and `value` is its relative URL */
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
