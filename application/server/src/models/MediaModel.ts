import Objection, { Model, ModelOptions, Pojo } from 'objection';
import { MediaHonkServerBase } from '../_Base';
import { CoversModel } from './CoversModel';
import { MediaMetaModel } from './MediaMetaModel';
import { MetaModel } from './MetaModel';
import { SourcesModel } from './SourcesModel';
import {BaseHonkModel} from './_ModelBase';

export class MediaModel extends BaseHonkModel {

	/** Table name is the only required property. */
	static tableName = 'media';
	static mediaMetaRelationTableName = `${this.tableName}_${MetaModel.tableName}`;

	id: number = null!;
	title: string = null!;
	abs_url: string = null!;
	// filename: string = null!;
	// rel_url: string = null!;
	cover_img_id?: number = null!;

	// media_id: number = null!;
	// meta_id: number = null!;

	// media_meta: {
	// 	media_id: number;
	// 	meta_id: number;
	// } = null!;

	static async mountMediaTable() {
		try {
			await this.mountTable(this.tableName, (table)=> {
				table.increments('id');
				table.string('title').unique().notNullable();
				table.string('abs_url').unique().notNullable();
				// table.string('rel_url');
				// table.integer('rel_url_id').references('id');
				table.integer('cover_img_id').references('id').inTable(CoversModel.tableName);
				// table.integer('source_id').references('id').inTable(SourcesModel.tableName);
			});
			await this.knex().schema.alterTable(this.tableName, (table)=> {
				table.unique(['title', 'abs_url']);
			});

			// await this.mountTable(this.mediaMetaRelationTableName, (table)=> {
			// 	table.integer('media_id').notNullable().references('id').inTable(this.tableName);
			// 	table.integer('meta_id').notNullable().references('id').inTable(MetaModel.tableName);
			// });
			// await this.knex().schema.alterTable(this.mediaMetaRelationTableName, (table)=> {
			// 	table.unique(['media_id', 'meta_id']);
			// });
		} catch (err) {
			//
		}
	}

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	 */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'title', 'abs_url' ],

			properties: {
				id: { type: 'integer' },
				title: { type: 'string' },
				abs_url: { type: ['string', 'null'] },
				// filename: { type: 'string' },
				// rel_url: { type: ['string', 'null'] },
				// rel_url_id: { type: ['integer', 'null'] },
				cover_img_id: { type: ['integer', 'null'] },
				// source_id: { type: [ 'integer' ] }

				// Properties defined as objects or arrays are
				// automatically converted to JSON strings when
				// writing to database and back to objects and arrays
				// when reading from database. To override this
				// behaviour, you can override the
				// Model.jsonAttributes property.
				// address: {
				// 	type: 'object',
				// 	properties: {
				// 		street: { type: 'string' },
				// 		city: { type: 'string' },
				// 		zipCode: { type: 'string' }
				// 	}
				// }
			}
		};
	}  
	
	/** This object defines the relations to other models. 
	 * @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-relationmappings
	 */
	static get relationMappings() {
		return {
			covers: {
				relation: Model.ManyToManyRelation,
				modelClass: CoversModel,
				join: {
					from: 'media.cover_img_id',
					to: 'covers.id'
				}
			}
		}
	}
	
	static async insertSingleMediaEntryRow(mediaEntry: Honk.DB.media): Promise<number | null> {
		let mediaEntryId: number | null = null!;
		try {
			await (
				this.query()
					.insert(mediaEntry)
					.onConflict(['title', 'abs_url'])
					.ignore()
					.then((insertMediaEntryResult)=>{
						if (insertMediaEntryResult.id > 0) {
							mediaEntryId = insertMediaEntryResult.id;
						}
					})
					.then(async ()=>{
						if (mediaEntryId !== null) {
							return;
						}
						await (
							this.query()
								.select()
								.where('abs_url', '=', mediaEntry.abs_url)
								.then((selectedMedia)=>{
									if (selectedMedia.length > 0) {
										mediaEntryId = selectedMedia[0].id;
									} else {
										throw new Error(`Failed to insert or find row with abs_url of: ${mediaEntry.abs_url}`)
									}
								})
						)
					})
			)
		} catch (err) {
			MediaHonkServerBase.emitter(
				'error', 
				err instanceof Error ? err : new Error('Unhandled exception. MediaModel.insertSingleMediaEntryRow()')
			);
		}
		return mediaEntryId
	}

	static async insertManyMediaEntryRows(entriesProps: Pick<Parameters<typeof this.insertMediaEntriesWithRelationalFields>[0], 'entries' | 'coverId'>) {
		// console.log(entriesProps)
	}

	/**
	 * 
	 * @param mediaProps 
	 * @returns An array of tuples where _tuple[0]_ is the `index` attribute of a media entry, and _tuple[1]_ is the row ID in the `media` table
	 */
	static async insertMediaEntriesWithRelationalFields(mediaProps: {entries: Honk.Media.BasicLibraryEntry['entries'], metaRowIds: number[], coverId: number}) {
		const mediaEntryIds: number[] = [];
		try {
			for await (const entry of mediaProps.entries) {
				// if (entry.filename.indexOf('futurama') > -1) {
				// 	console.log({...mediaProps})
				// }
				await this.insertSingleMediaEntryRow({
					title: entry.title,
					abs_url: entry.filename,
					cover_img_id: mediaProps.coverId
				})
				.then(function(rowId){
					if (rowId !== null) {
						mediaEntryIds.push(rowId);
					}
					return rowId
				})
				.then(async (mediaId)=>{
					if (mediaId !== null) {
						for await (const metaId of mediaProps.metaRowIds) {
							if (typeof(metaId) === 'number') await MediaMetaModel.insertNewMediaMetaRelationRow(mediaId, metaId);
						}
					}
				})
				.catch(err=>{
					// console.log(err)
				})
			}
		} catch (err) {
			// console.log(err)
		}
		return mediaEntryIds
	}

}
