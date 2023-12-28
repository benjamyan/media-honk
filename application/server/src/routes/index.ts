import { $Procedure, $Router } from './trpc';
import { getStaticAsset } from './stream/getStaticAsset';
import { streamVideo } from './stream/streamVideo';
import { getMediaBundles } from './content/getMediaBundles';
import { getMediaTypeList } from './content/getMediaTypeList';
import { getMetaList } from './content/getMetaList';
import { getCoverImage } from './resource/getCoverImage';

export const appRoutes = $Router({
    ping: $Procedure.query(() => 'pong'),
    resource: $Router({
        cover: getCoverImage
    }),
    content: $Router({
        meta: getMetaList,
        type: getMediaTypeList,
        bundles: getMediaBundles
    }),
    stream: $Router({
        image: getStaticAsset,
        video: streamVideo
    })
});

export type AppRouter = typeof appRoutes;
