import { MutableRefObject } from "react";
import { MediaAssetBundle } from "../../types";

export type LibraryView = 'GRID' | 'ROW';
export type MediaView = null | Honk.Media.StoredMediaTypes;

export type AssetLibrarySettings = {
    /** All asset passed from the API
     * - `null` if the API call hasnt been made/completed yet
     * - `Record` where key is the `_guid` of the asset bundle contained in value
     */
    assetBucket: null | Record<string, MediaAssetBundle>;
    metaArtistBucket: Array<string>;
    metaCategoryBucket: Array<string>;
    // assetBucket: null | ;
    // assetBucket: Record<MediaAssetBundle['_guid'], MediaAssetBundle> | null;
    libraryView: LibraryView;
    mediaView: MediaView;
    updateLibraryContext: (args0: {
            action: 'UPDATE';
            payload: any;
        })=> void;
}
