export type AcceptedMediaTypes = Honk.Media.PossibleMediaTypes;
/**
 * `VU` video unique (movie)
 * `VS` video series (tv show)
 * `AS` audio series (album, podcast)
 * `AU` audio unique (singles)
 * `IS` image series (image gallery)
 * `IU` image unique (unique images (idk why))
 * `X` unknown media type
 */
export type StoredMediaTypes = `${'V' | 'A' | 'I'}${'U' | 'S' | 'X'}` | 'X';
// export type StoredMediaTypes = 'VU' | 'VS' | 'VX' | 'AS' | 'AU'| 'AX' | 'IS' | 'IU' | 'IX' | 'X';
// export type StoredMediaTypes = 'V' | 'A' | 'I' | 'X';

export interface MediaItemEntry {
    index: number;
    filename: string;
    title: string;
}
export interface ConfiguredMediaProperties {
    title: string;
    subtitle?: string;
    artists?: string[];
    categories?: string[];
    type?: AcceptedMediaTypes;
}
export interface UniqueMediaDefinition extends ConfiguredMediaProperties {
    _guid: string;
}
export interface AssociatedMediaProperties extends Omit<ConfiguredMediaProperties, 'type'> {
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