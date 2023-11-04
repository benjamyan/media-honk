import type { TRPCError, inferProcedureOutput } from '@trpc/server';
import { AppRouter } from '../routes';
import { TRPCResult } from '@trpc/server/dist/rpc';
// import { $Router } from '../routes/trpc';

/**
 * Enum containing all api query paths
 */
export type TQuery = keyof AppRouter['_def']['procedures'];
//
// type TProc<T extends any> = keyof T['_def']['procedures'];
// type  RouterType<T extends any> = T extends string ? T : never;
// export type AppRouterTest = {
//     [A in TQuery]: AppRouter[A] extends ReturnType<typeof $Router>
//       ? keyof AppRouter[A]['_def']['procedures']
//       : keyof AppRouter[A]
// }
// type Foo = keyof AppRouter['content']['_def']['procedures']
// type Bar = keyof AppRouter['resource']['_def']['procedures']
// type Baz = AppRouter['ping']
// type Bug = keyof AppRouter['stream']['_def']['procedures']
// type Bar = keyof Foo['_def']['procedures']
/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = InferQueryOutput<'hello'>
 */
export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<
  AppRouter['_def']['procedures'][TRouteKey]
>;
// type test = InferQueryOutput<'content'>
export type InferMediaRouteResult<T extends unknown> = {
  error?: TRPCError;
  result?: TRPCResult<T>;
}
  // JSONRPC2.ErrorResponse |  JSONRPC2.ResultResponse<TRPCResult<T>> 
