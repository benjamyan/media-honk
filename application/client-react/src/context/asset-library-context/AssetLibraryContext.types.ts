import { MutableRefObject } from "react";

export type LibraryView = 'GRID' | 'ROW';
export type MediaType = null | Honk.Media.StoredMediaTypes;

export type AssetLibrarySettings = {
    assetBucket: Record<Honk.Media.AssetBundle['_guid'], Honk.Media.AssetBundle> | null;
    // assetBucket: MutableRefObject<Record<Honk.Media.AssetBundle['_guid'], Honk.Media.AssetBundle> | null>;
    libraryView: LibraryView;
    mediaType: MediaType;
    updateLibraryContext: ()=> void;
}
