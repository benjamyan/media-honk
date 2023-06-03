export type LibraryView = string;
export type MediaType = string;
export type AssetLibrarySettings = {
    libraryView: LibraryView;
    mediaType: MediaType;
    updateLibraryContext: ()=> void;
}
