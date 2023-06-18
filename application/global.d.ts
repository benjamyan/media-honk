/// <reference types="node" />

// import { default as Node } from 'node';
import { v4 } from 'uuid';

declare global {
    namespace Honk {
        namespace Server {
            interface AssetBundle {
                _guid: string;
                _bundleId: number;
                _mediaEntries: Array<number>;
                _coverId: number | undefined;
                title: string;
                subTitle: string | undefined;
                category: string[];
                artist: string[];
                type: Honk.Media.StoredMediaTypes;
            }
        }
        namespace Media {
            type PossibleMediaTypes = 'movie' | 'series' | 'gallery' | 'album' | 'singles';
            type StoredMediaTypes = `${'V' | 'A' | 'I'}${'U' | 'S' | 'X'}` | 'X';
            interface AssetBundle extends Omit<Honk.Server.AssetBundle, '_bundleId' | '_mediaEntries' | '_coverId'> {
                length: number;
            }
        }
        namespace Request {
            type RequestMediaTypes = 'A' | 'V' | 'I';
        }
    }
}
