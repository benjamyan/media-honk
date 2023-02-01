import { default as Express, query } from 'express';
import { Serve } from '../types';
import { MetaModel } from '../models/MetaModel';
import { CommonRoute } from './CommonRouter';

export class MediaRoutes extends CommonRoute {
    public router!: Express.Router;
    
    constructor() {
        super();
        this.router = Express.Router();
        this.router.get('/meta', this.getMeta.bind(this));
        this.router.get('/media', this.getMedia.bind(this));
        
    }
    
    /** Simple function to get table row entries that are not of type _null_ from `meta` table
     * @param req 
     * - `{ req.query?: 'artists' | 'categories' }` if passed an object relative to the query given will be returned containing only items fitting those columns
     * @param res 
     * - `success` responds with `code 200` and `Array<string|typeof req.query>`
     * - `failure` responsd with `code 400` and `Error as string`
     */ 
    public getMeta(req: Serve.Request, res: Serve.Response): void {
        try {
            type ExpectedRequestResult = {
                status: number;
                body: Record<string, string[]>;
            }
            const queryType: string | null = (function(){
                if (Object.entries(req.query).length > 0) {
                    if (req.query.metatype === undefined) {
                        throw new Error('Invalid query parameter provided')
                    } else if (req.query.metatype === 'artists' || req.query.metatype === 'categories') {
                        return req.query.metatype
                    } else {
                        throw new Error('Invalid metatype query given')
                    }
                }
                return null
            })();
            Promise
                .all(
                    queryType === null
                        ? [
                            MetaModel.metaRowContentGetter('artist_name'), 
                            MetaModel.metaRowContentGetter('category_name')
                        ]
                        : [MetaModel.metaRowContentGetter(
                            queryType === 'artists'
                                ? 'artist_name'
                                : 'category_name'
                        )]
                )
                .then((response: any[]): any[] => {
                    /** Common error handling */
                    if (!Array.isArray(response[0]) || (queryType === null &&  !Array.isArray(response[0]))) {
                        /** Either the promise didnt return an array */
                        throw new Error('Unexpected content returned from query')
                    }
                    return response
                })
                .then((success: any[]): ExpectedRequestResult => {
                    /** Successful response was gotten, parse the data and pass it to the responding block */
                    let response = {
                        status: 200,
                        body: {}
                    }
                    if (queryType !== null) {
                        if (success[0].length === 0) {
                            /** DB returned no entries for query selection */
                            response.status = 204;
                            return response
                        }
                        response.body = { [queryType]: success[0] };
                    } else {
                        if ([...success[0], ...success[1]].length === 0) {
                            /** DB returned no entries for query selection */
                            response.status = 204;
                            return response
                        }
                        response.body = {
                            artists: success[0],
                            categories: success[1]
                        }
                    }
                    return response
                })
                .then((result: ExpectedRequestResult): void =>{
                    if (!result.status || !result.body) {
                        throw new Error('Bad request');
                    } else if (!Object.values(result.body).every((entity)=>Array.isArray(entity))) {
                        throw new Error('Invalid body parsed from request');
                    }
                    res
                        .status(result.status || 400)
                        .send(result.body || 'Unhandled exception');
                })
                .catch((err): void =>{
                    console.log(err)
                    return this.errorResponse({
                        res, 
                        ...this.errorConstructor(err)
                    });
                });
        } catch (err) {
            console.log(err);
            return this.errorResponse({
                res, 
                ...this.errorConstructor(err)
            });
        }
    }

    public getMedia(req: Serve.Request, res: Serve.Response) {
        console.log(this)
        return
    }
}

export default new MediaRoutes().router
