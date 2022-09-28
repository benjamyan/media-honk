import express from "express";
import * as Path from 'node:path'

import { authenticateCredentials, validateRequest } from "../controllers/auth";
import { Honk } from "../types";

export const authRoutes = ()=> {
    const router = express.Router();
    
    router.get(['/','*'], function(req: Honk.Request, res: Honk.Response, next: Honk.NextFunction) {
        console.log('GET auth')
        // console.log(req.headers['X-Request-Origin'])

        if (req.headers.cookie !== undefined) {
            next()
        } else {
            res.statusCode = 200;
            res.set({
                "Content-Type": "text/html",
                // "X-Request-Origin": (
                //     req.headers['X-Request-Origin'] || '/test'
                // )
            });
            res.sendFile(Path.resolve(__dirname, '../../static/admin.html'));
        }
    });

    router.post(['/','*'], function(req: Honk.Request, res: Honk.Response, next: Honk.NextFunction) {
        console.log('POST auth')

        // TODO limit the amount of retries allowed
        try {
            console.log({...req.body})
            if (!req.body.name || !req.body.pass) throw new Error('Missing fields');

            // const attemptNumber: string | undefined = req.headers["X-Attempts"] as string;
            const redirectOnFail = ()=> {
                res.statusCode = 303;
                res.set({
                    "Location": "/auth/login",
                    // "X-Attempts": (
                    //     attemptNumber === undefined ? '5' : (parseInt(attemptNumber as string) - 1).toString()
                    // )
                })
                res.send()
            }
            const authToken = "Basic " + Buffer.from(req.body.name + ':' + req.body.pass).toString('base64');

            

            req.headers.authorization = authToken;
            
            const authFields = validateRequest(req);
            if (authFields instanceof Error) {
                throw new Error('Did not pass baseline auth')
            } else if (authFields === undefined) {
                redirectOnFail()
            } else {
                const validateCreds = authenticateCredentials(authFields.name, authFields.pass, res.locals.users);
                if (validateCreds instanceof Error || !validateCreds) {
                    redirectOnFail()
                } else {
                    res.statusCode = 302;
                    res.set({
                        "Location": "/",
                        "Authorization": authToken,
                        "Set-Cookie": authToken
                        // "X-Request-Origin": req.originalUrl
                    })
                    // res.cookie(authToken);

                    res.redirect('/')
                    // res.send()
                }
            }
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    })

    return router
}

// export default serverRoutes