export type AcceptedMediaTypes = Honk.Media.PossibleMediaTypes;

export type StoredMediaTypes = Honk.Media.StoredMediaTypes;
// export type StoredMediaTypes = `${'V' | 'A' | 'I'}${'U' | 'S' | 'X'}` | 'X';

export interface MediaItemEntry {
    index: number;
    filename: string;
    title: string;
}
export interface ConfiguredMediaAssetProperties {
    title: string;
    subtitle?: string;
    artists?: string[];
    categories?: string[];
    type?: AcceptedMediaTypes;
}
export interface UniqueMediaDefinition extends ConfiguredMediaAssetProperties {
    _guid: string;
}
export interface ResolvedMediaAssetProperties extends Omit<ConfiguredMediaAssetProperties, 'type'> {
    // uuid: string;
    // baseUrl: string;
    /** The relative URL relative to our API */
    // relativeUrl: PathLike;
    /** Name of the source in our configuration file */
    // sourceUrl: PathLike;
    /** The found cover image (if any) */
    // coverImageUri?: string;
    /** The media items under this entry  */
    entries: Array<MediaItemEntry>;
    coverUrl?: string;
    type: StoredMediaTypes;
    // 6.02.2023 added to beat type errors
    // mediaType?: string;
    // mediaUrl: Record<string, string>;
}