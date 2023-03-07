/// <reference types="node" />

import { PathLike } from 'node:fs';

declare global {
    namespace Honk {
        interface Configuration {
            dns: string;
            namespace: string;
            domain: string;
            directory: PathLike;
            api: {
                dev_http_port: number;
                dev_https_port: number;
                // dev_http: string;
                // dev_https: string;
                use_https: boolean;
                permitted_origins: string[];
                users: string[];
                admins: string[];
                media_paths: Record<string, string>;
            };
            db: {
                file: string;
                // host: string;
                // port: number;
                // username: string;
                // password: string;
                // db_name: string;
                // allow_insecure: boolean;
            };
        }
        namespace DB {
            interface source {
                id: number;
                title: string;
                abs_url: string;
            }
            interface bundles {
                main_title: string;
                sub_title?: string;
                cover_img_id?: number;
                media_type: 'VU','VS','AU','AS','GU','GS';
            }
            interface media {
                title: string;
                abs_url: string;
                // filename: string;
                // rel_url?: string,
                // rel_url_id?: number;
                cover_img_id?: number;
                // source_id: number
            }
            interface meta {
                artist_name?: string;
                artist_id?: number;
                category_name?: string;
                category_id?: number;
            }
            interface covers {
                file_url: string;
                source_id: string;
            }
            interface media_meta {
                media_id: number;
                meta_id: number;
            }
            interface bundle_media {
                bundle_id: number;
                media_id: number;
                media_index?: number;
            }
            interface Schema {
                // [key: keyof Schema]: Honk.DB.Schema[keyof Schema];
                media: DB.media[];
                bundles: DB.bundles[];
                sources: DB.source[];
                meta: DB.meta[];
                covers: DB.covers[];
                media_meta: DB.media_meta[];
                bundle_media: DB.bundle_media[];
            }
        }
        namespace Media {
            type AcceptedMediaTypes = 'movie' | 'series' | 'gallery' | 'album'
            interface MediaItemEntry {
                index: number;
                filename: string;
                title: string;
            }
            interface BaselineMediaProperties {
                title: string;
                subtitle?: string;
                artists?: string[];
                categories?: string[];
                type: Honk.Media.AcceptedMediaTypes;
            }
            interface MediaPropertyDefition extends BaselineMediaProperties {
                _guid: string;
            }
            
            interface BasicLibraryEntry extends BaselineMediaProperties {
                /** The relative URL relative to our API */
                // relativeUrl: PathLike;
                /** Name of the source in our configuration file */
                // sourceUrl: PathLike;
                /** The found cover image (if any) */
                // coverImageUri?: string;
                /** The media items under this entry  */
                entries: Array<MediaItemEntry>;
                coverUrl?: string;
                // mediaUrl: Record<string, string>;
                // uuid: string;
                // baseUrl: string;
            }
        }
    }
}
// export {};


// declare global {
//     namespace NodeJS {
//         interface ProcessEnv {
//             BASE_DIRECTORY: string;
//             DB_FILE_PATH: string;
//             NODE_ENV: 'development' | 'staging' | 'production';
//             API_DOMAIN?: string;
//             API_PORT?: string;
//             API_TOKEN?: string;
//         }
//     }
// }

// declare namespace MediaHonk {
//     export type JobPostEntry = {
//         abs_url: string;
//         job_title: string;
//         role_type: 'frontend' | 'fullstack' | 'ui/ux';
//         company_name: string;
//         yoe: 'ANY' | `${number}` | null;
//         keywords: Array<string>;
//         severity: number;
//         date_scraped: string;
//         date_applied: string | null;
//         _applied: boolean;
//         _guid: string;
//     }
//     export type NewJobInfoData = (
//         Pick<JobInfoEntry, 'abs_url' | 'company_name' | 'job_title'> 
//         & Partial<Omit<JobInfoEntry, 'keywords'>> 
//         & {
//             keywords?: string;
//         }
//     )
// }
