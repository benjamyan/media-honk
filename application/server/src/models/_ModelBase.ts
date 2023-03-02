import { Model } from 'objection';
import { default as Knex } from 'knex';

import { MediaHonkServerBase } from '../_Base';

/** 
 * - https://vincit.github.io/objection.js/api/model/ 
 * - https://github.com/knex/knex
 * */

export class BaseHonkModel extends Model {
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
				.catch((err)=>{
					console.log(err);
					MediaHonkServerBase.emitter('error', {
						error: `Failure mounting table: ${this.tableName}`,
						severity: 1
					})
				})
				
		)
	}

	static mountDatabaseTables() {
		// this.knex()
		// 	.schema
		// 	.createTableIfNotExists(BundlesModel.tableName, (table)=> {
		// 		table.increments('id').primary();
		// 		table.string('main_title').notNullable().unique();
		// 		table.string('sub_title');
		// 		/** 
		// 			VU = video unique (movie) 
		// 			VS = video series (episodes)
		// 			AU = audio unique (singles)
		// 			AS = audio series (album)
		// 			GU = gallery unique (singles)
		// 			GS = gallery series (ebook)
		// 		*/
		// 		table.string('media_type').notNullable().checkBetween(['VU','VS','AU','AS','GU','GS']);
		// 		table.integer('cover_img_id').references('id').inTable('covers');
		// 	})
		// 	.createTableIfNotExists(`${this.tableName}_${MediaModel.tableName}`, (table)=> {
		// 		table.increments('bundle_id').notNullable().references('id').inTable(BundlesModel.tableName);
		// 		table.integer('media_id').notNullable().references('id').inTable(MediaModel.tableName);
		// 		table.integer('media_index').unique();
		// 	})
		// 	.createTableIfNotExists(CoversModel.tableName, (table)=> {
		// 		table.increments('id').primary();
		// 		table.string('file_url').unique();
		// 		table.integer('source_id').references('id').inTable(SourcesModel.tableName);
		// 	})
		// 	.createTableIfNotExists(MediaModel.tableName, (table)=> {
		// 		table.increments('id').primary();
		// 		table.string('title').notNullable();
		// 		table.string('filename').notNullable().unique();
		// 		table.string('rel_url');
		// 		table.integer('rel_url_id').references('id');
		// 		table.integer('cover_img_id').references('id').inTable(CoversModel.tableName);
		// 		table.integer('source_id').references('id').inTable(SourcesModel.tableName);
		// 	})
		// 	.createTableIfNotExists(`${MediaModel.tableName}_${MetaModel.tableName}`, (table)=> {
		// 		table.integer('media_id').notNullable().references('id').inTable(MediaModel.tableName);
		// 		table.integer('meta_id').notNullable().references('id').inTable(MetaModel.tableName);
		// 	})
		// 	.createTableIfNotExists(MetaModel.tableName, (table)=> {
		// 		table.increments('id').primary();
		// 		table.string('artist_name');
		// 		table.integer('artist_id').references('id');
		// 		table.string('category_name');
		// 		table.integer('category_id').references('id');
		// 	})
		// 	.createTableIfNotExists(SourcesModel.tableName, (table)=> {
		// 		table.increments('id').primary();
		// 		table.string('title').notNullable().unique();
		// 		table.string('abs_url').notNullable().unique();
		// 	})
	}

	// static get columnNameMappers() {
	//   return snakeCaseMappers();
	// }
}
