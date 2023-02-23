import { default as Express } from 'express';
import { default as dotenv } from 'dotenv';
import { default as Path } from 'path';
import { default as Knex } from 'knex';

import { MediaHonkServer } from "./Server"

// dotenv.config({ path: Path.resolve(__dirname, '../.env') });
// const app = Express();
// app.locals = null!;

// let databaseConnection: ReturnType<typeof Knex> = null!;

// const mediaEntries: Record<string, Honk.Media.BaselineMediaProperties> = {};

new MediaHonkServer()

// export {
//     app,
//     mediaEntries,
//     databaseConnection
// }
