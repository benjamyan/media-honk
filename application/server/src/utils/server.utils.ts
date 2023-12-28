import { $Logger, _Config } from "../server";
import { default as Path } from 'path';
import { default as Fs } from 'fs';
import { default as Yaml } from 'yaml';

/** Captures CLI variables and adds them to the local settings obj */
export const mountProcessSettings = async ()=> {
	const requiredEnv = ['HONK_ENV', 'BASE_DIRECTORY', 'CONFIG_FILE_PATH'];
	const optionalEnv = ['AGGREGATION_TYPE', 'ENABLE_LOOSE_AGGREGATION', 'DEPRECATED_DEFS'];
	_Config.cli = requiredEnv.concat(optionalEnv).reduce((envAccumulator, keyname) => {
		let currentEnvValue = process.env[keyname],
			newLocalSetting;
		switch (keyname) {
			case 'LOOSE_AGGREGATE':
			case 'DEPRECATED_DEFS': {
				currentEnvValue = currentEnvValue as HonkServer.ProcessEnv['DEPRECATED_DEFS'];
				if (!currentEnvValue || currentEnvValue.toLowerCase() !== 'true') {
					newLocalSetting = false;
				} else {
					newLocalSetting = true;
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
export const mountLocalConfig = async ()=> {
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
		throw new Error(`Unhandled exception`);
	} finally {
		$Logger.info('- Env config loaded');
	}
};
