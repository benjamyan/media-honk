import { MediaAssetBundle } from "../../types";

export type LibraryView = 'GRID' | 'ROW';
export type MediaView = Honk.Media.StoredMediaTypes[];

type UpdateLibraryContextProps = {
    action: 'UPDATE';
    payload: Partial<Omit<AssetLibrarySettings, 'updateLibraryContext' | 'assetBucket' | 'mediaView' | 'metaSearch'>> & {
        assetBucket?: Array<MediaAssetBundle>;
        mediaView?: MediaView | 'NULL';
        metaSearch?: string | string[];
    }
} | {
    action: 'RESET'
}

export type AssetLibrarySettings = {
    /** All asset passed from the API
     * - `null` if the API call hasnt been made/completed yet
     * - `Record` where key is the `_guid` of the asset bundle contained in value
     */
    assetBucket: Record<string, MediaAssetBundle>;
    metaArtistBucket: Array<string>;
    metaCategoryBucket: Array<string>;
    // assetBucket: null | ;
    // assetBucket: Record<MediaAssetBundle['_guid'], MediaAssetBundle> | null;
    libraryView: LibraryView;
    mediaView: MediaView;
    metaSearch: Array<string>;
    // updateLibraryContext: (args0: Omit<AssetLibrarySettings, 'updateLibraryContext'>, args1: UpdateLibraryContextProps)=> Omit<AssetLibrarySettings, 'updateLibraryContext'>;
    updateLibraryContext: (args0: UpdateLibraryContextProps)=> void;
}
