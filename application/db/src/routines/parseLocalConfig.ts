import { default as Fs } from 'node:fs';
import * as Path from 'node:path';
import * as Yaml from 'yaml';

import { Honk } from 'mediahonk';

export const parseLocalConfigFile = async (): Promise<Honk.Configuration | Error> => {
    try {
        // console.log(process.env.CONFIG_FILE)
        // console.log(process.env.PWD)
        const configFile = Path.resolve(process.env.PWD as string, process.env.CONFIG_FILE as string);
        // const configFile = Path.resolve(__dirname, '../../../config.yaml');
        if (!Fs.existsSync(configFile)) {
            throw new Error('Failed to locate required configurations')
        }
        
        return Yaml.parse(Fs.readFileSync(configFile, 'utf-8')) as Honk.Configuration;
    } catch (err) {
        console.log(err)
        if (err instanceof Error) {
            return err
        } else {
            return new Error('Unhandled exception')
        }
    }
}
