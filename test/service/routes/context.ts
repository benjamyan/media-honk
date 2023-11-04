

import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
export function createContext({ req, res }: CreateFastifyContextOptions) {
//   const user = { name: req.headers.username ?? 'anonymous' };
  // let media_type: 'image' | 'video' | null = null;
  // if (req.headers.accept?.includes('image')) {
  //   media_type = 'image'
  // } else if (req.headers.accept?.includes('video')) {
  //   media_type = 'video'
  // }
  
  return { req, res };
}
export type Context = inferAsyncReturnType<typeof createContext>;