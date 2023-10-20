import { z } from 'zod'
import { $Procedure } from "../trpc";
import { MetaModel } from '../../models';
import { TRPCError } from '@trpc/server';

/** 
 * @method getMeta Simple function to get table row entries that are not of type _null_ from `meta` table
 * @param req 
 * - `{ req.query?: 'artists' | 'categories' }` if passed an object relative to the query given will be returned containing only items fitting those columns
 * @param res 
 * - `success` responds with `code 200` and `Array<string|typeof req.query>`
 * - `success` responsds with `204` if the library contains no entries
 * - `failure` responsd with `code 400` and `Error as string`
 */
export const getMetaList = (
    $Procedure
        .input(
            z.object({
                meta: z.union([z.literal('artist_name'), z.literal('category_name')])
            }).optional()
        )
        .query(async ({ input, ctx: { res } }) => {
            const metaRowContent = await MetaModel.getAllMetaRowContent(input?.meta)
            if (metaRowContent instanceof Error) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'ERR',
                    cause: metaRowContent
                })
            }
            return metaRowContent
        })
);

