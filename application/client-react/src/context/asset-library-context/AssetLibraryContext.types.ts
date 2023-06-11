export type LibraryView = 'GRID' | 'ROW';
export type MediaType = null | Honk.Media.StoredMediaTypes;

export type AssetLibrarySettings = {
    libraryView: LibraryView;
    mediaType: MediaType;
    updateLibraryContext: ()=> void;
}
