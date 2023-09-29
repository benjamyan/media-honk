import { $Procedure, $Router } from './trpc';
import { contentRouter } from './content';
import { resourceRouter } from './resource';
import { streamRouter } from './stream';

export const appRouter = $Router({
    ping: $Procedure.query(() => 'pong'),
    resource: resourceRouter,
    content: contentRouter,
    stream: streamRouter
});
  
export type AppRouter = typeof appRouter;