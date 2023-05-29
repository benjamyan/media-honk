// import { default as Express } from 'express';
// import { default as dotenv } from 'dotenv';
// import { default as Path } from 'path';
// import { default as Knex } from 'knex';

import { MediaHonkServer } from "./Server"

new MediaHonkServer()

// dotenv.config({ path: Path.resolve(__dirname, '../.env') });

// const app = Express();

// let databaseConnection: ReturnType<typeof Knex> = null!,
//     localConfig: Honk.Configuration = null!

// const mediaEntries: Record<string, Honk.Media.BaselineMediaProperties> = {};

// export const MediaHonkServer = new MediaHonkServerInstance({
//     app,
//     databaseConnection,
//     localConfig,
//     mediaEntries
// })

// export {
//     app,
//     mediaEntries,
//     databaseConnection,
//     localConfig
// }
