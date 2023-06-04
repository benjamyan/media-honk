import { default as Express } from 'express';
import { ModelService } from '../services/common/ModelService';
import { MediaHonkServerBase } from '../_Base';

type PermittedKeys = `permitted${Capitalize<'query' | 'body'>}`;
type RequiredKeys = `required${Capitalize<'header'>}`;
type AllAcceptedKeys = PermittedKeys | RequiredKeys;

export type RouterProps = {
    [Key in AllAcceptedKeys & string]: (
        Key extends PermittedKeys
            ? Record<string, Array<string>>
            : Record<string, Record<string, string>>
    )
}

type PermittedConfig = {
    [key: string]: {
        required: Array<string>;
        permitted: Array<string>;
    }
}
type RequiredConfig = {
    [key: string]: Record<string, string>;
}
export type RouterConfig = {
    [Key in AllAcceptedKeys & string]: Key extends PermittedKeys ? PermittedConfig : RequiredConfig
}

/**
 * @class RouterBase extends {@link ModelService}
 * @param routeConfig {@link RouterProps} A configuration object passed in to define required and permitted request properties
 * @todo 
 * - `parseRequireElements` should happen on instanciation, not at request time
 */

export class RouteBase extends MediaHonkServerBase {
    private routeConfig: RouterConfig = {
        permittedQuery: null!,
        permittedBody: null!,
        requiredHeader: null!
    };
    
    constructor(routerProps: RouterProps) {
        super();

        let configPermittedEntry,
            key: keyof RouterConfig = null!;
        for (const config in routerProps) {
            if (config.toLowerCase().indexOf('permitted') > -1) {
                key = config as PermittedKeys;
                if (routerProps[key] !== undefined) {
                    this.routeConfig[key] = (
                        Object.entries(routerProps[key])
                            .reduce((obj, entry) => {
                                configPermittedEntry = this.buildPermittedConfigOptions(entry[1])
                                return (
                                    configPermittedEntry instanceof Error
                                        ? { ...obj }
                                        : { ...obj, [entry[0]]: configPermittedEntry }
                                )
                            }, {})
                    )
                } 
            } else {
                key = config as RequiredKeys;
                this.routeConfig[key] = routerProps[key]// as RouterConfigIntermediary<'required'>;
            }
        }
        // this.routeConfig = { ...routerProps };
        
        /** Binds the calling context to its instance - fixes having to bind every call from its invoking class */
        Object
            .getOwnPropertyNames(RouteBase.prototype)
            .filter((propertyName)=> propertyName !== 'constructor')
            .forEach((method) => {
                // @ts-expect-error
                this[method] = this[method].bind(this)
            });

        // this.app.use('*', [ this.onRouteTraffic, this.setRouteResponseHeaders ]);
    }

    // private onRouteTraffic(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    //     try {
    //         this.logger(`>> ${req.protocol}: ${req.baseUrl}`);
    //         next();
    //     } catch (err) {
    //         this.emit('error', {
    //             error: err,
    //             severity: 3,
    //             response: res
    //         })
    //     }
    // }

    // private setRouteResponseHeaders(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    //     res.header('Access-Control-Allow-Origin', 'http://192.168.0.11:8080');
    //     next();
    // }

    /**
     * @method buildPermittedConfigOptions Utility function to return an object containing both required, and optional elements from a given array in `routeConfig`
     * @param elements Array<string> from a given `routeConfig` method definition
     * - Elements appended with `!` are treated as required, others will be optional.
     * @returns
     * - Object { required: [...], optional: [...] } the `optional` value will contain both the required AND optional elements, but standardized.
     * - Error depending on context
     */
    private buildPermittedConfigOptions(elements: string[]): PermittedConfig[string] | Error {
        if (!elements || !Array.isArray(elements)) {
            return new Error(`Invalid parameter. Expected Array, received: ${typeof elements}`)
        }
        return {
            required: (
                elements
                    .filter((element)=> element.startsWith('!'))
                    .map((element)=>element.substring(1))
            ),
            permitted: elements.map((element)=> element.startsWith('!') ? element.substring(1) : element)
        }
    }
    
    public parseRequestHeaders(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        try {
            requestHeaderCheck:
            if (this.routeConfig.requiredHeader === undefined) {
                return next();
            } else {
                const methodHeaders = this.routeConfig.requiredHeader[req.method.toLowerCase()];
                if (methodHeaders === undefined || Object.keys(methodHeaders).length === 0) {
                    return next();
                }
                for (const header in methodHeaders) {
                    if (req.header(header) === undefined || req.header(header) !== methodHeaders[header]) {
                        break requestHeaderCheck;
                    }
                }
                return next()
            }
            res.status(412).send('Invalid content-type given');
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.parseRequestHeaders`),
                severity: 2,
                response: res
            })
        }
    }

    public parsePermittedRouteOptions(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        try {
            const permittedConfig: Record<string, PermittedConfig> = (
                Object.entries(this.routeConfig).reduce(
                    (config, entry)=> (
                        entry[0].startsWith('permitted')
                            ? { ...config, [entry[0]]: entry[1] }
                            : config
                    ),
                    {}
                )
            );
            let methodConfig,
                currentField: keyof Express.Request;
            for (const config in permittedConfig) {
                methodConfig = permittedConfig[config][req.method.toLowerCase()];
                currentField = config.split('permitted')[1].toLowerCase() as keyof Express.Request;

                if (methodConfig !== undefined) {
                    /** Parse the request queries for fields marked as required */
                    if (methodConfig.required.some((key)=> req[currentField][key] === undefined)) {
                        console.log(methodConfig)
                        res.status(400).send(`Missing required ${config} fields`);
                        return 
                    }

                    for (const reqQuery of Object.keys(req[currentField])) {
                        if (!methodConfig.permitted.includes(reqQuery)) {
                            res.status(400).send(`Invalid ${config} fields provided`);
                            return 
                        }
                    }  
                }
            }

            return next();
            
        } catch (err) {
            this.emit('error', {
                error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.parseRequestQueries`),
                severity: 2,
                response: res
            })
        }
    }

    // public parseRequestQueries(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    //     try {
    //         // const methodQueries = (
    //         //     this.routeConfig.permittedQueries !== undefined
    //         //         ? this.routeConfig.permittedQueries[req.method.toLowerCase()] || []
    //         //         : []
    //         // );
    //         const methodQueries = this.routeConfig.permittedQueries[req.method.toLowerCase()] || []

    //         requestQueryCheck:
    //         if (Object.keys(req.query).length === 0) {
    //             if (methodQueries.required.length === 0) {
    //                 /** No queries move on */
    //                 return next()
    //             } else {
    //                 /** Required queries not given; send error response back */
    //                 break requestQueryCheck;
    //             }
    //         } else {
    //             /** Parse the request queries for fields marked as required */
    //             if (methodQueries.required.some((key)=> req.query[key] === undefined)) {
    //                 break requestQueryCheck;
    //             }

    //             // if (methodQueries.required.length > 0) {
    //             //     /** Parse the request queries for fields marked as required */
    //             //     if (methodQueries.required.some((key)=> req.query[key] === undefined)) {
    //             //         break requestQueryCheck;
    //             //     }
    //             // } else if (Object.keys(req.query).length === 0) {
    //             //     /** No queires present; continue on brother tom */
    //             //     return next();
    //             // } else if (methodQueries.length === 0 && Object.keys(req.query).length > 0) {
    //             //     /** Unexpected queries; a request should only contain those permitted */
    //             //     break requestQueryCheck;
    //             // }
    //             for (const reqQuery of Object.keys(req.query)) {
    //                 if (!methodQueries.permitted.includes(reqQuery)) {
    //                     break requestQueryCheck;
    //                 }
    //             }
    //             return next();
    //         }
    //         res.status(400).send('Bad query parameter');
    //     } catch (err) {
    //         this.emit('error', {
    //             error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.parseRequestQueries`),
    //             severity: 2,
    //             response: res
    //         })
    //     }
    // }

    // public validateRequestBody(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    //     try {
    //         const routeBodyKeys = (
    //             this.routeConfig.permittedBodyKeys === undefined
    //                 ? []
    //                 : this.routeConfig.permittedBodyKeys[req.method.toLowerCase()] || []
    //         );
    //         const parsedKeys = this.routeConfig.permittedBodyKeys[req.method.toLowerCase()] || []

    
    //         requestBodyCheck:
    //         if (req.body === undefined || Object.keys(req.body).length === 0) {
    //             res.status(406).send('No body present in request')
    //         } else if (routeBodyKeys.length === 0) {
    //             res.status(422).send('Schema not defined on server')
    //         } else {
    //             const parsedKeys = this.buildPermittedConfigOptions(routeBodyKeys);
                
    //             if (parsedKeys instanceof Error) {
    //                 throw new Error('Invalid validation array. RouterBase.validateRequestBody');
    //             } else if (parsedKeys.required.length > 0) {
    //                 if (parsedKeys.required.some((key)=> req.body[key] === undefined)) {
    //                     res.status(406).send('Missing required fields');
    //                     return;
    //                     // break requestBodyCheck;
    //                 }
    //             }
    //             for (const key of Object.keys(req.body)) {
    //                 if (!parsedKeys.permitted.includes(key)) {
    //                     res.status(406).send(`Invalid fields (${key})`);
    //                     return;
    //                     // break requestBodyCheck;
    //                 }
    //             }
    //             return next();
    //         }
    //         res.status(406).send('Failed validation check')
    //     } catch (err) {
    //         this.emit('error', {
    //             error: err instanceof Error ? err : new Error(`Unhandled exception: RouterBase.validateRequestBody`),
    //             severity: 2,
    //             response: res
    //         })
    //     }
    // }

}