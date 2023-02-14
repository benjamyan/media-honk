import { default as Express, query } from 'express';
import { Serve } from '../types';
import { MetaModel } from '../models/MetaModel';
import { CommonRoute } from './CommonRoutes';
import { ModelInteractionService } from '../services/MetaInteractionService';
import { Model } from 'objection';
import { FactoryService } from '../services/common';

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
    private getMeta(req: Serve.Request, res: Serve.Response): void {
        try {
            const queryType: Serve.Request['query']['metatype'] = (function(){
                if (Object.entries(req.query).length > 0) {
                    if (req.query.metatype === undefined) {
                        throw new Error('Invalid query parameter provided')
                    } else if (req.query.metatype !== 'artists' && req.query.metatype !== 'categories') {
                        throw new Error('Invalid metatype query given')
                    } else {
                        return req.query.metatype
                    }
                }
                return undefined
            })();
            ModelInteractionService
                .queryMetaColumns(queryType)
                .then((result: Serve.CommonResponse): void =>{
                    res
                        .status(result.statusCode || 400)
                        .send(result.body || 'Unhandled exception');
                })
                .catch((err): void =>{
                    console.log(err)
                    CommonRoute.errorResponse(res, FactoryService.buildErrorResponseEntity(err));
                });
        } catch (err) {
            console.log(err);
            CommonRoute.errorResponse(res, FactoryService.buildErrorResponseEntity(err));
        }
    }

    private getMedia(req: Serve.Request, res: Serve.Response) {
        console.log(this)
        return
    }
}

export default new MediaRoutes().router
