import { ProcedureRouterRecord, initTRPC } from '@trpc/server';
import { Context } from './context';
import { $Fastify } from '../server';
import { ApplicationHook, ApplicationHookLookup, HookAsyncLookup, HookLookup, LifecycleHook } from 'fastify/types/hooks';
import { FastifyInstance } from 'fastify';

const $Trpc = initTRPC.context<Context>().create({});

// export type Test<T extends ApplicationHook | LifecycleHook> = 
//     T extends 

export const $Router = $Trpc.router;
// export const $RouteHooks: {
//     [key: string]: Parameters<typeof $Fastify.addHook>[0]
// } = {}
// export const $Router = (procedures: {
//     [key: string]: {
//         handler: ProcedureRouterRecord[keyof ProcedureRouterRecord],
//         hooks?: {
//             [N in LifecycleHook]?: HookLookup<N> | HookAsyncLookup<N>
//             // FastifyInstance['addHook']
//             //HookLookup<N> | HookAsyncLookup<N>
//             // (args: (Parameters<(HookLookup<N> | HookAsyncLookup<N>)>[0]))=> ReturnType<HookLookup<N> | HookAsyncLookup<N>>
//         }
//     }
// })=> {
//     const routeProcedures: ProcedureRouterRecord = {}
//     for (const proc in procedures) {
//         if (procedures[proc].hooks != undefined) {
//             for (const hook in procedures[proc].hooks) {
//                 /// @ts-ignore
//                 $Fastify.addHook(hook, procedures[proc].hooks[hook])
//             }
//             // procedures[proc].hooks?.forEach((hook)=>$RouteHooks[proc] = hook)
//         }
//         routeProcedures[proc] = procedures[proc].handler
//     }
//     return $Trpc.router(routeProcedures)
// };

export const $Middleware = $Trpc.middleware;
export const $Procedure = $Trpc.procedure;
export const $MergeRouters = $Trpc.mergeRouters;
