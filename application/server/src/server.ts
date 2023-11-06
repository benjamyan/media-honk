/// <reference path='../server.d.ts' />

import Objection from 'objection';
import { default as dotenv } from 'dotenv';
import { default as fastify } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
// import fastifyMultipart from '@fastify/multipart';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { default as Fs } from 'fs';
import { default as Yaml } from 'yaml';
import { default as Knex } from 'knex';
import { default as Path } from 'path';
import { createContext } from './routes/context';
import { AppRouter, appRoutes } from './routes';
import { _knexConfig } from './lib/knex';
import { BundleMediaModel, BundlesModel, CoversModel, MediaMetaModel, MediaModel, MetaModel } from './models';
import { aggregateMediaBundles } from './services/db/aggregateMediaBundles';
import { _fastifyStaticConfig } from './lib/fastify-static';
import { fastifyStream } from './plugin/fastifyStream';
import { JSONRPC2, TRPCResponse, TRPCResponseMessage, TRPCResult, TRPCSuccessResponse } from '@trpc/server/dist/rpc';
import { TRPCError, inferProcedureOutput } from '@trpc/server';
import { InferMediaRouteResult, InferQueryOutput } from './types/trcp-utils';
import { audioExtensions, imageExtensions, videoExtensions } from './config/constants';
import { getMediaExtFromFilename } from './utils/parseFileExt';
import send, { SendStream } from '@fastify/send';

dotenv.config({ path: Path.resolve(__dirname, '../.env') });

export const $Fastify = fastify({
	logger: true
});
export const $Logger = $Fastify.log;
export const _Config = {
	local: <HonkServer.ApplicationConfig> null!,
	cli: <HonkServer.EnvSettings> null!
}

/** Captures CLI variables and adds them to the local settings obj */
const mountProcessSettings = async ()=> {
	// $Logger.info('MediaHonkServerBase.mountProcessEnvSettings()');
	const requiredEnv = ['HONK_ENV', 'BASE_DIRECTORY', 'CONFIG_FILE_PATH'];
	const optionalEnv = ['AGGREGATION_TYPE', 'ENABLE_LOOSE_AGGREGATION', 'DEPRECATED_DEFS'];
	_Config.cli = requiredEnv.concat(optionalEnv).reduce((envAccumulator, keyname) => {
		let currentEnvValue = process.env[keyname],
			newLocalSetting;
		switch (keyname) {
			case 'LOOSE_AGGREGATE':
			case 'DEPRECATED_DEFS': {
				currentEnvValue = currentEnvValue as HonkServer.ProcessEnv['DEPRECATED_DEFS'];
				if (currentEnvValue.toLowerCase() === 'true') {
					newLocalSetting = true;
				} else {
					newLocalSetting = false;
				}
				break;
			}
			default: newLocalSetting = currentEnvValue;
		}
		return {
			...envAccumulator,
			[keyname]: newLocalSetting
		}
	}, {} as HonkServer.EnvSettings);

	requiredEnv.forEach((requiredVar) => {
		if (requiredVar === undefined) {
			throw new Error(`Required env variable not set: ${requiredVar}`);
		}
	})

	$Logger.info('- Env settings loaded');
}
/** Mount and check the configuation in the local YAML file */
const mountLocalConfig = async ()=> {
	// $Logger.info('MediaHonkServerBase.mountLocalConfig()');
	try {
		if (_Config.local !== null) return;

		if (Fs.existsSync(Path.join(_Config.cli.BASE_DIRECTORY, _Config.cli.CONFIG_FILE_PATH))) {
			_Config.local = (
				Yaml.parse(Fs.readFileSync(Path.join(_Config.cli.BASE_DIRECTORY, _Config.cli.CONFIG_FILE_PATH), 'utf-8'))
			);
			return;
		} else throw new Error('Failed to locate required configurations');
	} catch (err) {
		if (err instanceof Error) {
			throw err
		}
		throw new Error(`Unhandled exception: MediaHonkServerBase.mountLocalConfig`);
	} finally {
		$Logger.info('- Env config loaded')
	}
};

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
		await mountProcessSettings();
		await mountLocalConfig();
		await establishDatabase();
		await aggregateMediaBundles({ overwrite: true });
		$Fastify.register(fastifyTRPCPlugin, {
			trpcOptions: {
				router: appRoutes,
				createContext
			}
		});
		// https://www.npmjs.com/package/@fastify/static
		$Fastify.register(fastifyStatic, {
			prefix: '/public/',
			root: Path.resolve('/')
		});

		$Fastify.register(fastifyStream);
		
		// https://www.npmjs.com/package/@fastify/cors
		$Fastify.register(cors, {
			origin: ['http://192.168.0.11:8080', 'http://192.168.0.11:8081'],
			preflightContinue: true,
			methods: ['GET', 'POST', 'OPTIONS']
		});
		await $Fastify.listen({ port: 8081, host: '192.168.0.11' })
	} catch (err) {
		$Fastify.log.error(err)
		process.exit(1)
	}
}
startServer();
