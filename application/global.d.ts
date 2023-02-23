/// <reference types="node" />

import { PathLike } from 'node:fs';

declare global {
    interface MediaEntryItem {
        index: number;
        filename: string;
        title: string;
    }
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
                media_paths: Record<string | number, PathLike>;
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
                abs_url: PathLike;
            }
            interface media {
                id: number;
                rel_url: string | PathLike;
                cover_img_uri?: string;
                main_title: string;
                sub_title?: string;
                entries: MediaEntryItem[];
                source_id: number;
            }
            interface artist {
                id: number;
                name: string;
                source_id: number;
            }
            interface category {
                id: number;
                name: string;
                source_id: number;
            }
            interface media_relation {
                media_id: number;
                artist_id?: number;
                category_id?: number;
            }
            interface Schema {
                media: DB.media[];
                source: DB.source[];
                artist: DB.artist[];
                category: DB.category[];
                media_relation: DB.media_relation[];
            }
        }
        namespace Media {
            interface BaselineMediaProperties {
                title: string;
                subtitle?: string;
                artists: string[];
                categories: string[];
                _guid: string;
            }
            interface BasicLibraryEntry extends BaselineMediaProperties {
                /** The relative URL relative to our API */
                relativeUrl: PathLike;
                /** Name of the source in our configuration file */
                sourceUrl: PathLike;
                /** The found cover image (if any) */
                coverImageUri?: string;
                /** The media items under this entry  */
                entries: MediaEntryItem[];
    
                mediaUrl: Record<string, string>;
                uuid: string;
                baseUrl: string;
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
