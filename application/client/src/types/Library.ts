/// <reference path="../../../global.d.ts" />

export type MediaPlayerType = 'VIDEO' | 'AUDIO' | 'IMAGE';

export interface MediaAssetBundle extends Honk.Media.AssetBundle {
    // coverImgUrl: string;
}
// export interface MediaLibraryEntry {
//     uuid: string;
//     baseUrl: string;
//     mediaSource: string | undefined;
//     mediaType: string | undefined;
//     title: string;
//     mediaUrl: string | Record<string, string>;
//     galleryUrl: string | undefined,
//     coverUrl: string | undefined,
//     actors: string[],
//     categories: string[]
// }
