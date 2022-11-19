import { default as Auth } from 'basic-auth';
import { Serve } from '../../types';

export const validateRequest = (req: Serve.Request): Auth.BasicAuthResult | undefined | Error => {
    try {
        // const filterDangerousChar = ()=> {}
        // if (!!req.body.name && !!req.body.pass) {
            const authReq = Auth(req);
            
            if (authReq === undefined) {
                return undefined
            } else if (authReq.name.length === 0 || authReq.pass.length === 0) {
                return undefined
            }
            return authReq
        // } else throw new Error('Missing fields')
        
    } catch (err) {
        console.log(err)
        return new Error('Unhandled exception')
    }
}
