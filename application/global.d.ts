/// <reference types="node" />

// import { default as Node } from 'node';
import { v4 } from 'uuid';

declare global {
    namespace Honk {
        namespace Request {
            type RequestMediaTypes = 'A' | 'V' | 'I';
        }
        namespace Media {
            type PossibleMediaTypes = 'movie' | 'series' | 'gallery' | 'album' | 'singles';
            type StoredMediaTypes = `${'V' | 'A' | 'I'}${'U' | 'S' | 'X'}` | 'X';
            interface AssetBundle {
                _guid: string; // typeof v4;
                // bundle_id: number;
                title: string;
                subTitle: string | undefined;
                category: string[];
                artist: string[];
                length: number;
                type: StoredMediaTypes;
                // coverImgUrl: string | undefined;
            }
        }
    }
}
