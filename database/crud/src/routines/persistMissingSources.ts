import * as Mysql from 'mysql2/promise';
import { default as Fs } from 'node:fs';
import * as Path from 'node:path';
import { Honk } from 'mediahonk';

import { LocalConfig, Kill, Database } from '..';
import { aggregateSourceEntries } from '../statements/aggregateSourceEntries';

/**
 * Pulls down all media sources from the provided paths and creates an object matching the database configuration
 * @returns @see Honk.DB.source object array
 */
const factory_mediaSources = (): Omit<Honk.DB.source, 'id'>[] | void => {
    try {
        const mediaSources: Omit<Honk.DB.source, 'id'>[] = [];
        let currentPath!: string;

        for (const source in LocalConfig.serve.media_paths) {
            currentPath = LocalConfig.serve.media_paths[source];
            if (Fs.existsSync(Path.resolve(__dirname, currentPath))) {
                mediaSources.push({
                    title: source,
                    abs_path: currentPath
                })
            } else {
                throw new Error('Given path does not exist')
            }
        }

        return mediaSources
    } catch (err) {
        console.log(err)
        Kill('Failed to build media sources')
    }
};

/**
 * Pulls down the given sources in the media database and checks them against the local media sources provided
 * @if a single mediasource does not exist it will persist it to the database
 * @if the database sources table is empty, it will persist all local sources compiled
 * @todo if a local sources `title` matches a table source `title`, both the local and table source `abs_path` will be checked on local disk. If remote source path does not exist, the column is overwritten. If it does, nothing will happen and the user is warned
 * @todo if a local sources `abs_path` matches a table source `abs_path`, but titles do not, the tables `title` value will be overwritten with the local sources `title`
 *
 * @returns void
 */
export const persistMissingSources = async (): Promise<void> => {
    try {
        
        const remoteSources = await aggregateSourceEntries();
        if (remoteSources instanceof Error || !Array.isArray(remoteSources)) {
            throw remoteSources
        }

        const localSources = factory_mediaSources();
        if (!Array.isArray(localSources)) {
            throw new Error('Failed to compile local media sources')
        } else if (localSources.length === 0) {
            console.warn(`No local media sources were digested`)
        }
        
        let currentRemote: Honk.DB.source | undefined;
        for await (const source of localSources) {
            if (remoteSources.length > 0) {
                currentRemote = remoteSources.find((remoteSource)=> {
                    if (remoteSource.title === source.title || remoteSource.abs_path === source.abs_path) {
                        return remoteSource
                    }
                });
            }

            if (currentRemote !== undefined) {
                if (source.title !== currentRemote.title) {
                    console.warn(`Oveerwriting title for "${currentRemote.title}" to "${source.title}"`)
                    //
                } else if (source.abs_path !== currentRemote.abs_path) {
                    console.warn(`Paths for "${currentRemote.title}" and "${source.title}" do not match and will be checked`)
                    //
                } else {
                    console.log(`Skipping source "${source.title}" because it already exists`)
                }
            } else {
                await (
                    Database
                        .query('INSERT INTO source SET ?', source)
                        .then(()=>{
                            console.log(`SUCCESS adding entry "${source.title}" to DB.source`)
                        })
                        .catch((err)=> {
                            console.warn(`FAILED adding entry "${source.title}" to DB.source`)
                            console.warn(err)
                        })
                )
            }
        }
    } catch (err) {
        console.log(err)
        //todo
    }
}
