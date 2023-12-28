import { ProcedureRouterRecord, initTRPC } from '@trpc/server';
import { Context } from './context';
import { $Fastify } from '../server';
import { ApplicationHook, ApplicationHookLookup, HookAsyncLookup, HookLookup, LifecycleHook } from 'fastify/types/hooks';
import { FastifyInstance } from 'fastify';

const $Trpc = initTRPC.context<Context>().create({});

export const $Router = $Trpc.router;
export const $Middleware = $Trpc.middleware;
export const $Procedure = $Trpc.procedure;
export const $MergeRouters = $Trpc.mergeRouters;
