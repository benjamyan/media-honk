import { initTRPC } from '@trpc/server';
import { Context } from './context';
/// @ts-ignore
// import superjson from 'superjson';

const $Trpc = initTRPC.context<Context>().create({
    // transformer: superjson
});
export const $Router = $Trpc.router;
export const $Procedure = $Trpc.procedure;
export const $Middleware = $Trpc.middleware;
export const $MergeRouters = $Trpc.mergeRouters;