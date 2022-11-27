import { PathLike } from 'node:fs';

interface MediaEntryItem {
    index: number; 
    filename: string; 
    title: string;
}

export namespace Honk {
    // export type MediaTypes = 'series' | 'movie' | 'gallery' | 'singles' | 'podcast' | 'album';
    // export interface Configuration {
    //     dns: string;
    //     server: string;
    //     domain: string;
    //     dev_http_port: number;
    //     dev_https_port: number;
    //     use_https: boolean;
    //     allowedOrigins: string[];
    //     userMediaPaths: Record<string | number, string>;
    //     users: string[];
    //     admins: string[];
    // }
    export interface Configuration {
        dns: string;
        namespace: string;
        domain: string;
        directory: PathLike;
        api: {
            dev_http_port: number;
            dev_https_port: number;
            use_https: boolean;
            permitted_origins: string[];
            users: string[];
            admins: string[];
            media_paths: Record<string | number, PathLike>;
        }
        mysql: {
            host: string;
            port: number;
            username: string;
            password: string;
            db_name: string;
            allow_insecure: boolean
        }
    }
    export namespace DB {
        export interface source {
            id: number;
            title: string;
            abs_url: PathLike;
        }
        export interface media {
            id: number;
            rel_url: string | PathLike;
            cover_img_uri?: string;
            main_title: string;
            sub_title?: string;
            entries: MediaEntryItem[];
            source_id: number;
        }
        export interface artist {
            id: number;
            name: string;
            source_id: number;
        }
        export interface category {
            id: number;
            name: string;
            source_id: number;
        }
        export interface media_relation {
            media_id: number;
            artist_id?: number;
            category_id?: number;
        }
        export interface Schema {
            media: DB.media[];
            source: DB.source[];
            artist: DB.artist[];
            category: DB.category[];
            media_relation: DB.media_relation[];
        }
    }
    export namespace Media {
        export interface BaselineMediaProperties {
            // type: MediaTypes;
            title: string;
            subtitle?: string;
            artists: string[];
            categories: string[];
        }
        export interface BasicLibraryEntry extends BaselineMediaProperties {
            /** The relative URL relative to our API */
            relativeUrl: PathLike;
            /** Name of the source in our configuration file */
            sourceUrl: PathLike;
            /** The found cover image (if any) */
            coverImageUri?: string;
            /** The media items under this entry  */
            entries: MediaEntryItem[];
            /** Given title */
            // title: string;
            /** Given subtitle */
            // subtitle?: string;
            /** Array of our artists */
            // artists: string[];
            /** Array of given categories */
            // categories: string[];
        }
    }
    // export interface BaselineMediaProperties {
    //     // type: MediaTypes;
    //     title: string;
    //     subtitle?: string;
    //     artists?: string[];
    //     categories?: string[];
    // }
    // export interface BasicLibraryEntry {
    //     // uuid: string;
    //     /** The relative URL relative to our API */
    //     baseUrl: string;
    //     /** Object where `key` is the media title to be displayed and `value` is its relative URL */
    //     mediaUrl: Record<string, string>;
    //     // audioUrl: Record<string, string> | undefined;
    //     // galleryUrl: string | undefined;
    //     // coverUrl: string | undefined;

    //     mediaSource: string | undefined;
    //     // type: MediaTypes;
    //     title: string;
    //     subtitle?: string;
    //     artists: string[];
    //     categories: string[];
    // }
}
