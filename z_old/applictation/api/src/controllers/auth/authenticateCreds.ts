// import { Request, Response, NextFunction } from 'express';
import { default as TSSCMP } from 'tsscmp'
// import { default as Auth } from 'basic-auth'
// import * as Path from 'node:path'

export const authenticateCredentials = (name: string, pass: string, users: string[]): boolean | Error => {
    try {
        let valid: boolean = false,
            currUser: string[] = [];
        for (const user of users) {
            currUser = user.split('__');
            if (currUser.length > 2) {
                break;
            } else if (TSSCMP(currUser[0], name) && TSSCMP(currUser[1], pass)) {
                valid = true;
                break
            }
        }
        return valid
    } catch (err) {
        console.log(err)
        return new Error('Unhandled exception')
    }
}
