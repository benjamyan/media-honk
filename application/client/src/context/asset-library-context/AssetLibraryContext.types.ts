import { MediaAssetBundle } from "../../types";

export type LibraryView = 'GRID' | 'ROW';
export type MediaView = Honk.Media.StoredMediaTypes[];

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
    updateLibraryContext: (args0: {
            action: 'UPDATE';
            payload: Partial<Omit<AssetLibrarySettings, 'updateLibraryContext' | 'assetBucket' | 'mediaView'>> & {
                assetBucket?: Array<MediaAssetBundle>;
                mediaView?: MediaView | 'NULL';
            }
        })=> void;
}
