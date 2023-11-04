import * as Movies from './bundles/movies.json';
import * as Shows from './bundles/tvshows.json';

export const mockBundles: Array<Honk.Media.AssetBundle> = [
    ...Movies,
    ...Shows
];
export const mockMeta = mockBundles.reduce((metaAccumulator, { artist, category })=> {
    for (const art of artist) {
        if (!metaAccumulator.artist.includes(art)) metaAccumulator.artist.push(art);
    }
    for (const cat of category) {
        if (!metaAccumulator.category.includes(cat)) metaAccumulator.category.push(cat);
    }
    return metaAccumulator
}, { artist: [], category: [] } as Record<string, string[]>);
export const mockMediaTypes = mockBundles.reduce((typeAccumulator, {type})=> {
    if (!typeAccumulator.includes(type)) {
        typeAccumulator.push(type);
    }
    return typeAccumulator
}, [] as string[]);