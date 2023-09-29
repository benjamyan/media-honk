import { z } from "zod"
import { $Procedure } from "../trpc"
import { findBundlesByMetaField } from "../../services/db/findBundlesByMeta";
import { selectAllBundles } from "../../services/db/selectAllBundles";
import { StoredMediaTypes } from "../../types/MediaProperties";
import { TRPCError } from "@trpc/server";

/**
 * @param query 
 * - `artist` and/or `category` as a properly formatted URL query parameter
 *   - Ex. `artist=Foo+Bar,Baz,Bozz&category=Lorem+Ipsum,Dolor+Sit,Amet`
 * - `mediatype` paginated bundles with the specified media type
 *   - V(S|X|U) = video, A(S|X|U) = audio, etc
 *   - If provided in conjunction with meta, will returns those media types matching the provided meta
 * - If no query provided, will default to returning pagingated bundles for every type
 *   - Default pagination limit is 10 per media type
 * 
 * @param res Results that _explicitely_ match, where the only values returned are those matching ALL parameters
 * Array of objects:
 * - `_guid` <String> unique identifier for the bundle
 * - `bundle_id` <Number> direct ID ref that can be queried
 * - `main_title` <String> title of the bundle
 * - `sub_title` <String | null> subtitle (if available)
 * - `categories` <String[]> applicable categories
 * - `artists` <String[]> applicable artists
 * - `cover_img_url` <String | null> cover image by URL
 * - `length` <Number>
 * - `type` <String> `(A|S|V)(S|U|X)` | `X`
 */
export const getMediaBundles = (
    $Procedure
        .input(
            z.object({
                artist: z.string().optional(),
                category: z.string().optional(),
                page: z.number().optional(),
                type: z.enum(['VU','VS','AU','AS','IU','IS','X']).optional()
            })
        )
        .query(async ({ input }) => {
            let resolvedBundles: Honk.Server.AssetBundle[] | Error;
            if (!!input.artist && !!input.category) {
                resolvedBundles = new Error('BAD_REQUEST');
            } else if (!!input.artist || !!input.category) {
                resolvedBundles = await findBundlesByMetaField(
                    !!input.artist ? 'artist_name' : 'category_name',
                    (input.artist || input.category) as string
                );
            } else {
                resolvedBundles = await selectAllBundles();
            }

            if (resolvedBundles instanceof Error) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid query parameters given',
                    cause: resolvedBundles,
                });
            }
            if (input.type) {
                resolvedBundles = resolvedBundles.filter(
                    (bundle)=> bundle.type.startsWith(input.type as string)
                );
            }
            if (input.page) {
                resolvedBundles = [
                    ...Object.values(resolvedBundles.reduce((bundleAccumulator, AssetBundle)=> {
                        if (!bundleAccumulator[AssetBundle.type]) {
                            bundleAccumulator[AssetBundle.type] = [ AssetBundle ];
                        } else if (bundleAccumulator[AssetBundle.type].length < 10) {
                            bundleAccumulator[AssetBundle.type].push(AssetBundle);
                        }
                        return bundleAccumulator
                    }, {} as Record<StoredMediaTypes, Honk.Server.AssetBundle[]>)).flat(1)
                ];
            }
            
            return resolvedBundles.map((bundle)=>({
                ...bundle,
                length: bundle._mediaEntries.length,
                _bundleId: undefined,
                _coverId: undefined,
                _mediaEntries: undefined,
                coverImgUrl: undefined
            }));
        })
)