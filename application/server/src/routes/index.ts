// import { default as MediaRoutes } from './media';

// const mediaRoute = new MediaRoutes().router;

import { MediaRoutes } from './MediaRoute';

const mediaRoute = new MediaRoutes().router;

export { mediaRoute }
export { serverRoutes } from './server';
export { staticRoutes } from './static';

// export * from './media';
