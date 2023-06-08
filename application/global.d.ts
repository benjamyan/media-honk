/// <reference types="node" />

import { default as Node } from 'node';
import { v4 } from 'uuid';

declare global {
    namespace Honk {
        namespace Request {
            type RequestMediaTypes = 'A' | 'V' | 'I';
        }
        namespace Media {
            type PossibleMediaTypes = 'movie' | 'series' | 'gallery' | 'album' | 'singles';
            interface AssetBundle {
                _guid: string; // typeof v4;
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
