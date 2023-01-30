import { default as Express } from 'express';
import { Serve } from '../types';
import { Meta } from '../models/Meta';

export class MediaRoutes {
    public router!: Express.Router;
    
    constructor() {
        this.router = Express.Router();
        this.router.get('/meta', this.getMeta.bind(this));
        
    }

    private metaRowContentGetter(row: 'artist_name' | 'category_name'): Promise<string[] | Error> | Error {
        try {
            return new Promise((resolve, reject)=> (
                Meta.query()
                    .whereNot(row, `NULL`)
                    .select(row)
                    .then((res: any)=>{
                        resolve(res.map((meta: any)=>meta[row]))
                        return 
                    })
                    .catch((err)=>{
                        reject(new Error(JSON.stringify(err)))
                        return 
                    })
            ));
        }
        catch (err) {
            return err instanceof Error ? err : new Error('Unhandled exception.')
        }
    }

    public getMeta(req: Serve.Request, res: Serve.Response) {
        let hasQuery: boolean = Object.entries(req.query).length > 0,
            metaResult: Record<string, string[]> = null!;
        try {
            let requestOperations: (Promise<string[] | Error> | Error)[] = [];
            if (hasQuery) {
                if (req.query.metaType === undefined) {
                    throw new Error('Route only accepts query of key `type`');
                } else if (req.query.metaType !== 'artists' && req.query.metaType !== 'categories') {
                    throw new Error('Route only accepts query of value of `artists | categories`');
                }
                requestOperations = [
                    this.metaRowContentGetter(
                        req.query.metaType === 'artists'
                            ? 'artist_name'
                            : 'category_name'
                    )
                ];
            } else {
                requestOperations = [
                    this.metaRowContentGetter('artist_name'), 
                    this.metaRowContentGetter('category_name')
                ];
            }
            Promise
                .all(requestOperations)
                .then((result: any[])=>{
                    res
                        .status(200)
                        .send(
                            hasQuery
                                ? {
                                    artists: req.query.metaType === 'artists' ? result[0] : undefined,
                                    categories: req.query.metaType === 'categories' ? result[0] : undefined
                                }
                                : {
                                    artists: result[0],
                                    categories: result[1]
                                }
                        );
                })
                .catch((err)=>{
                    console.log(err)
                    res
                        .status(400)
                        .send(JSON.stringify(err));
                });
                return;
        } 
        catch (err) {
            console.log(err);
            res
                .status(500)
                .send(JSON.stringify('Unhandled exception.'));
        }
    }
}

export default new MediaRoutes().router
