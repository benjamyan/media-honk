import { z } from "zod"
import { $Procedure } from "../trpc"
import { BundlesModel } from "../../models";

/**
 * @method getMediaTypeList A route handler to get a limited number of bundles by media type
 * @param req 
 * @param res 
 */
export const getMediaTypeList = (
    $Procedure.query(async () => {
            return await (
                BundlesModel
                    .query()
                    .select('media_type')
                    .then((bundles)=> bundles.map(({ media_type })=>media_type))
            );
        })
)