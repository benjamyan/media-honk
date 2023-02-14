import { MetaModel } from "../models/MetaModel";
import { Serve } from "../types";

export class ModelInteractionService {
    static metaTableRowContent: any;

    constructor() {

    }
    
    // public metaTableRowContent(row: 'artist_name' | 'category_name') {
    //     try {
    //         return new Promise((resolve, reject)=> (
    //             MetaModel
    //                 .column()
    //                 .query()
    //                 .select(['artist_name', 'category_name'])
    //                 .then((res: any)=>{
    //                     console.log(res)
    //                     resolve(res)
    //                     return 
    //                 })
    //                 .catch((err)=>{
    //                     reject(new Error(JSON.stringify(err)))
    //                     return 
    //                 })
    //         ));
    //     }
    //     catch (err) {
    //         return err instanceof Error ? err : new Error('Unhandled exception.')
    //     }
    // }

    static queryMetaColumns(metaType: Serve.Request['query']['metatype']): Promise<Serve.CommonResponse> {
        console.log(this.metaTableRowContent);
        return new Promise((resolve, reject)=> (
            Promise.all(
                metaType === undefined
                    ? [
                        MetaModel.metaRowContent('artist_name'), 
                        MetaModel.metaRowContent('category_name')
                    ]
                    : [MetaModel.metaRowContent(
                        metaType === 'artists'
                            ? 'artist_name'
                            : 'category_name'
                    )]
                )
                .then((metaQueryResponse: any[]): Array<string[]> => {
                    /** Common error handling */
                    if (!Array.isArray(metaQueryResponse[0]) 
                        || (metaType === undefined &&  !Array.isArray(metaQueryResponse[0]))
                        || metaQueryResponse.flat(1).some((metaEntry)=>typeof(metaEntry) !== 'string')
                    ) {
                        /** The response received from queyr was mishapen in some way */
                        throw new Error('Unexpected content returned from query');
                    }
                    return metaQueryResponse
                })
                .then((metaQuerySuccessData: Array<string[]>): Record<string, string[]> => {
                    if (metaType !== undefined) {
                        return { 
                            [metaType as string]: metaQuerySuccessData[0] 
                        };
                    }
                    return {
                        artists: metaQuerySuccessData[0],
                        categories: metaQuerySuccessData[1]
                    }
                })
                .then((formattedMetaQueryData: Record<string, string[]>): Serve.CommonResponse => {
                    /** Successful response was gotten, parse the data and pass it to the responding block */
                    let response: Serve.CommonResponse = {
                        statusCode: 200,
                        body: formattedMetaQueryData
                    }
                    if ([...Object.values(formattedMetaQueryData)].length === 0) {
                        response.statusCode = 204;
                    }
                    return response
                })
                .then((finalMetaQueryResult: Serve.CommonResponse): void =>{
                    if (!finalMetaQueryResult.statusCode || !finalMetaQueryResult.body) {
                        throw new Error('Bad request');
                    } else if (!Object.values(finalMetaQueryResult.body).every((entity)=>Array.isArray(entity))) {
                        throw new Error('Invalid body parsed from request');
                    }
                    resolve(finalMetaQueryResult)
                })
                .catch((err): void =>{
                    console.log(err)
                    reject(err instanceof Error ? err : new Error('Unhandled exception.'))
                })
        ))
    }

}
