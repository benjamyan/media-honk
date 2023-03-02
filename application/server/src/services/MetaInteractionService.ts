import { default as Express } from 'express'
// import { MetaModel } from "../models/MetaModel";
import { MediaHonkServerBase } from "../_Base";
// import { Serve } from "../types";

export class ModelInteractionService extends MediaHonkServerBase {
    // static metaTableRowContent: any;

    constructor() {
        super();

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

    // static queryMetaColumns(metaType: Express.Request['query']['metatype']): Promise<Record<string, string[] | Error>> {
    //     // console.log(this.metaTableRowContent);
    //     return new Promise((resolve, reject)=> (
    //         Promise.all(
    //             metaType === undefined
    //                 ? [
    //                     MetaModel.metaRowContent('artist_name'), 
    //                     MetaModel.metaRowContent('category_name')
    //                 ]
    //                 : [MetaModel.metaRowContent(
    //                     metaType === 'artists'
    //                         ? 'artist_name'
    //                         : 'category_name'
    //                 )]
    //             )
    //             .then((metaQueryResponse: any[]): Array<string[]> => {
    //                 /** Common error handling */
    //                 if (!Array.isArray(metaQueryResponse[0]) 
    //                     || (metaType === undefined &&  !Array.isArray(metaQueryResponse[0]))
    //                     || metaQueryResponse.flat(1).some((metaEntry)=>typeof(metaEntry) !== 'string')
    //                 ) {
    //                     /** The response received from queyr was mishapen in some way */
    //                     throw new Error('Unexpected content returned from query');
    //                 }
    //                 return metaQueryResponse
    //             })
    //             .then((metaQuerySuccessData: Array<string[]>) => {
    //                 if (metaType !== undefined) {
    //                     return resolve({ 
    //                         [metaType as string]: metaQuerySuccessData[0] 
    //                     })
    //                 }
    //                 return resolve({
    //                     artists: metaQuerySuccessData[0],
    //                     categories: metaQuerySuccessData[1]
    //                 })
    //             })
    //             .catch((err): void =>{
    //                 console.log(err)
    //                 return reject(err instanceof Error ? err : new Error('Unhandled exception. ModelInteractionService.queryMetaColumns'));
    //             })
    //     ))
    // }

}
