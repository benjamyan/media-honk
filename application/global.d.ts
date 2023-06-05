/// <reference types="node" />

import { default as Node } from 'node';

declare global {
    namespace Honk {
        namespace Media {
            type PossibleMediaTypes = 'movie' | 'series' | 'gallery' | 'album' | 'singles';
            interface MediaBundle {
                _guid: string;
                bundle_id: number;
                main_title: string;
                sub_title: string | undefined;
                category: string[];
                artist: string[];
                cover_img_url: string | undefined;
                length: number;
                type: string;
            }
        }
    }
}
