import { $Procedure, $Router } from './trpc';
import { contentRouter } from './content';
import { resourceRouter } from './resource';
import { streamRouter } from './stream';
import { $Logger } from '../server';
import { InferQueryOutput, TQuery } from '../types/trcp-utils';
import { getStaticAsset } from './stream/getStaticAsset';
import { streamVideo } from './stream/streamVideo';
import { getMediaBundles } from './content/getMediaBundles';
import { getMediaTypeList } from './content/getMediaTypeList';
import { getMetaList } from './content/getMetaList';
import { getCoverImage } from './resource/getCoverImage';
import { CreateRouterInner, inferRouterDef } from '@trpc/server';

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
    // ping: $Procedure.query(() => 'pong'),
    // resource: resourceRouter,
    resource: $Router({
        cover: getCoverImage
    }),
    // content: contentRouter,
    content: $Router({
        meta: getMetaList,
        type: getMediaTypeList,
        bundles: getMediaBundles
    }),
    // stream: streamRouter
    stream: $Router({
        static: getStaticAsset,
        video: streamVideo
    })
});
// export type AppRouter = {

// }
// export type AppRouter1 = typeof resourceRouter & typeof contentRouter & typeof streamRouter;
export type AppRouter = typeof appRoutes;
// type XXX = keyof AppRouter;
// export type AppRouterDef = inferRouterDef<AppRouter>;
// export type AppRouter2 = {
//     [K in keyof AppRouter['_def']['procedures']]: (
//         K extends keyof AppRouter 
//             ? inferRouterDef<AppRouter[K]> 
//             : never
//     )
// } & AppRouter;
// export type AppRouterOuter = CreateRouterInner<AppRouter, AppRouterDef>
// export type AppRouter = typeof appRoutes;
// export type AppRouter2 = InferQueryOutput<TQuery>;