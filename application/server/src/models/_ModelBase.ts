import Objection, { Model, StaticHookArguments } from 'objection';
import { default as Knex } from 'knex';

// import { MediaHonkServerBase } from '../_Base';
// import { $ModelCache } from '../services/cache/ModelCacheService';
// import { BundleMediaModel, BundlesModel, CoversModel, MediaMetaModel, MediaModel, MetaModel, ModelTables } from '.';
// import { $Logger } from '../server';
import { _knexConfig } from '../lib/knex';
import { $Logger } from '../server';

/** 
 * - https://vincit.github.io/objection.js/api/model/ 
 * - https://github.com/knex/knex
 * */

export class ModelBase extends Model {
	// Each model must have a column (or a set of columns) that uniquely
	// identifies the rows. The column(s) can be specified using the `idColumn`
	// property. `idColumn` returns `id` by default and doesn't need to be
	// specified unless the model's primary key is something else.
	static get idColumn() {
		return 'id';
	}
	
	static async mountTable(tableName: string, schemaCallback: Parameters<ReturnType<typeof Knex>['schema']['createTable']>[1]) {
		await (
			this.knex()
				.schema
				.hasTable(tableName)
				.then(async (tableExists)=>{
					if (!tableExists) {
						await this.knex().schema.createTable(tableName, schemaCallback)
					}
					return;
				})
				.catch((err)=>$Logger.error(err))
				
		)
	}

	static afterFind(args: StaticHookArguments<any, any>) {
		// if (MediaHonkServerBase.state.standing === 'server.listening') {
		// 	if (args.result.length == 0) return;
		// 	$ModelCache.set(args.result);
		// }
	}
	
	// static async connect(filename: string) {
    //     $Logger.info('MediaHonkServerBase.establishDatabaseConnection()');
    //     try {
    //         const $Knex = Knex({
	// 			..._knexConfig,
    //             // client: 'sqlite3',
    //             // useNullAsDefault: true,
    //             // acquireConnectionTimeout: 5000,
    //             connection: {
    //                 filename
    //             },
	// 			// ...config
    //         });
    //         Objection.Model.knex($Knex);
    //         $Logger.info('- Created DB');
            
    //         await (
	// 			Objection
	// 				.Model.knex()
	// 				.schema.hasTable(MediaModel.tableName)
	// 				.then(async (tablePresent)=>{
	// 					if (!tablePresent) {
	// 						$Logger.info('- Creating tables');
	// 						// await BundlesModel.mountBundlesTable();
	// 						// await CoversModel.mountCoversTable();
	// 						// await MetaModel.mountMetaTable();
	// 						// await MediaModel.mountMediaTable();
	// 						// await MediaMetaModel.mountMediaMetaTable();
	// 						// await BundleMediaModel.mountBundleMediaTable();
	// 					} else {
	// 						$Logger.info('- Tables present');
	// 					}
	// 				})
	// 				.then(()=>{
	// 					$Logger.info('- DB CONNECTED');
	// 				})
	// 		);
    //     } catch (err) {
	// 		$Logger.debug(err);
    //         // this.emit('error', {
    //         //     error: err instanceof Error ? err : new Error('Unable to establish database connection'),
    //         //     severity: 1
    //         // })
    //     }
    // }
	
}

// type KnexConnectionConfig<T extends Parameters<typeof Knex>[0]> = 
// 		T extends string 
// 			? never
// 			: T
