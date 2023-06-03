import { Model } from 'objection';
import { MediaHonkServerBase } from '../_Base';
import { SourcesModel } from './SourcesModel';
import {BaseHonkModel} from './_ModelBase';
import { CoversModelColumns } from './_ModelTypes';

export class CoversModel extends BaseHonkModel implements CoversModelColumns {
	static tableName = 'covers';
	
	/** Declarative column  names for type guard */
	id: number = null!;
	file_url: string = null!;
	source_id: number = null!;
	
	static async mountCoversTable() {
		await this.mountTable(this.tableName, (table)=> {
			table.increments('id').primary();
			table.string('file_url').unique();
			table.integer('source_id').references('id').inTable(SourcesModel.tableName);
		});
		// await this.knex().schema.alterTable(this.tableName, (table)=> {
		// 	table.unique(['file_url']);
		// })
	}

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'file_url','source_id' ],
			properties: {
				id: { type: 'integer' },
				file_url: { type: 'string' },
				source_id: { type: 'integer' }
			}
		};
	}

	/** This object defines the relations to other models. 
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-relationmappings
	*/
	static get relationMappings() {
		return {
			media: {
				relation: Model.HasManyRelation,
				modelClass: require('./MediaModel'),
				join: {
					from: 'covers.id',
					to: 'media.cover_img_id'
				}
			},
			source: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./SourcesModel'),
				join: {
					from: 'covers.source_id',
					to: 'sources.id'
				}
			},
			// media: {
			// 	relation: Model.ManyToManyRelation,
			// 	modelClass: require('./Media'),
			// 	join: {
			// 		from: 'meta.id',
			// 		through: {
			// 			from: 'media_meta.meta_id',
			// 			to: 'media_meta.media_id'
			// 		},
			// 		to: 'media.id'
			// 	}
			// },
		}
	}

	static async getCoverByMediaId(mediaId: number) {
		
	}

	static async insertCoverEntry(fileName: string) {
		return await (
			this.query()
				.insert({
					file_url: fileName,
					source_id: 1
				})
				.onConflict('file_url')
				.ignore()
				.then((insertedCover)=> {
					if (insertedCover.id !== undefined && insertedCover.id !== 0) {
						return insertedCover.id;
					}
				})
				.then(async (coverId)=>{
					if (coverId !== undefined) {
						return coverId
					}
					return await (
						this.query()
							.select()
							.where('file_url','=',fileName)
							.then((findCoverResult)=> {
								if (findCoverResult.length === 0) {
									return undefined
								} else if (findCoverResult.length > 1) {
									return undefined
								} else {
									return findCoverResult[0].id
								}
							})
					)
				})
				.catch(err=> {
					MediaHonkServerBase.emitter(
						'error', 
						err instanceof Error 
							? err 
							: new Error('Unhandled exception. CoversModel.insertCoverEntry'));
					return undefined;
				})
		);
	}

}
