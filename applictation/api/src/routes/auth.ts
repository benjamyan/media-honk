import express from "express";
import * as Path from 'node:path'

export const staticRoutes = ()=> {
    const router = express.Router();
    
    router.post('*', function(req, res) {
        console.log('auth')

        console.log(req.headers)
        console.log(req.body)

        // res.sendFile(Path.join(__dirname, req.url));
        res.send(201)
    })

    return router
}

// export default serverRoutes