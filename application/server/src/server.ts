/// <reference path='../server.d.ts' />

import Objection from 'objection';
import { default as dotenv } from 'dotenv';
import { default as fastify } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { default as Knex } from 'knex';
import { default as Path } from 'path';
import { createContext } from './routes/context';
import { appRoutes } from './routes';
import { _knexConfig } from './lib/knex';
import { BundleMediaModel, BundlesModel, CoversModel, MediaMetaModel, MediaModel, MetaModel } from './models';
import { aggregateMediaBundles } from './services/db/aggregateMediaBundles';
import { _fastifyStaticConfig } from './lib/fastify-static';
import { fastifyStream } from './plugin/fastifyStream';
import { mountLocalConfig, mountProcessSettings } from './utils/server.utils';
import { fastifyAuth } from './plugin/fastifyAuth';

dotenv.config({ path: Path.resolve(__dirname, '../.env') });

export const $Fastify = fastify({
	logger: true
});
export const $Logger = $Fastify.log;
export const _Config = {
	local: <HonkServer.ApplicationConfig> null!,
	cli: <HonkServer.EnvSettings> null!
}

const establishDatabase = async ()=> {
	const $Knex = Knex({
		..._knexConfig,
		connection: {
			filename: _Config.local.db.file
		}
	});
	Objection.Model.knex($Knex);
	await (
		Objection
			.Model.knex()
			.schema.hasTable(MediaModel.tableName)
			.then(async (tablePresent)=>{
				if (!tablePresent) {
					$Logger.info('- Creating tables');
					await BundlesModel.mountBundlesTable();
					await CoversModel.mountCoversTable();
					await MetaModel.mountMetaTable();
					await MediaModel.mountMediaTable();
					await MediaMetaModel.mountMediaMetaTable();
					await BundleMediaModel.mountBundleMediaTable();
					$Logger.info('- DB CONNECTED');
				} else {
					$Logger.info('- DB EXISTS');
					// $Logger.info('- Tables present');
				}
			})
	);
};
const startServer = async () => {
	try {

		$Fastify.register(fastifyTRPCPlugin, {
			trpcOptions: {
				router: appRoutes,
				createContext
			}
		});
		// https://www.npmjs.com/package/@fastify/static
		$Fastify.register(fastifyStatic, {
			prefix: '/public/',
			root: Path.join(__dirname, '../static'),
			dotfiles: 'ignore'
		});
		// https://www.npmjs.com/package/@fastify/cors
		$Fastify.register(cors, {
			origin: ['http://192.168.0.11:8080', 'http://192.168.0.11:8081'],
			preflightContinue: true,
			methods: ['GET', 'POST', 'OPTIONS']
		});
		// https://github.com/fastify/fastify-basic-auth
		$Fastify.register(fastifyAuth);
		// https://github.com/fastify/help/issues/526
		$Fastify.register(fastifyStream);
		
		await $Fastify.listen({ port: 8080, host: '192.168.0.11' });
	} catch (err) {
		$Logger.error(err);
		process.exit(1)
	}
};

(async function() {
	try {
		await mountProcessSettings();
		await mountLocalConfig();
		await establishDatabase();
		switch (process.env.HONK_ENV) {
			case 'aggregate': {
				await aggregateMediaBundles({ overwrite: true });
				break;
			}
			case 'serve': {
				startServer();
				break;
			}
			default: {
				if (_Config.cli.AGGREGATION_TYPE !== 'skip') {
					await aggregateMediaBundles({ overwrite: true });
				}
				startServer();
			}
		}
	} catch (err) {
		$Logger.error(err);
		process.exit(1);
	}
})()
