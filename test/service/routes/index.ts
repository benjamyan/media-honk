import { $Procedure, $Router } from './trpc';
import { contentRouter } from './content';
import { resourceRouter } from './resource';
import { streamRouter } from './stream';
import { $Logger } from '../server';

export const appRoutes = $Router({
    // ping: {
    //     handler: $Procedure.query(() => 'pong'),
    //     hooks: {
    //         onRequest: async (req, res, done)=> {
    //             $Logger.info('\nHI')
    //             done()
    //         }
    //     }
    // },
    ping: $Procedure.query(() => 'pong'),
    resource: resourceRouter,
    content: contentRouter,
    stream: streamRouter
});
// export type AppRouter = {

// }
// export type AppRouter = typeof appRouter & typeof resourceRouter & typeof contentRouter & typeof streamRouter;
export type AppRouter = typeof appRoutes;