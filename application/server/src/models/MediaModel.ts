import { Model } from 'objection';
import { Constants } from '../config';
import { MediaFactory } from '../factories';
import { MediaHonkServerBase } from '../_Base';
import { CoversModel } from './CoversModel';
import { MediaMetaModel } from './MediaMetaModel';
import { MetaModel } from './MetaModel';
import {BaseHonkModel} from './_ModelBase';
import { MediaModelColumns } from './_ModelTypes';

export class MediaModel extends BaseHonkModel implements MediaModelColumns {

	/** Table name is the only required property. */
	static tableName = 'media';
	static mediaMetaRelationTableName = `${this.tableName}_${MetaModel.tableName}`;

	id: number = null!;
	title: string = null!;
	abs_url: string = null!;
	cover_img_id?: number = null!;
	media_type: string = null!;
	
	static async mountMediaTable() {
		await this.mountTable(this.tableName, (table)=> {
			table.increments('id');
			table.string('title').notNullable();
			table.string('abs_url').unique().notNullable();
			table.string('media_type').notNullable().checkBetween(Constants.databaseMediaTypes);
			table.integer('cover_img_id').references('id').inTable(CoversModel.tableName);
		});
	}

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	 */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'title', 'abs_url', 'media_type' ],

			properties: {
				id: { type: 'integer' },
				title: { type: 'string' },
				abs_url: { type: 'string' },
				// filename: { type: 'string' },
				// rel_url: { type: ['string', 'null'] },
				// rel_url_id: { type: ['integer', 'null'] },
				cover_img_id: { type: ['integer', 'null'] },
				// source_id: { type: [ 'integer' ] }
				media_type: { type: 'string' }
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
					.onConflict([ 'abs_url' ])
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
					// .catch(err=>{
					// 	if (err instanceof Error && err.name === 'UniqueViolationError') {
					// 		MediaHonkServerBase.emitter(
					// 			'error', 
					// 			new Error(`Duplicate media entry with title: ${mediaEntry.title}`)
					// 		);
					// 	}
					// })
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
	static async insertMediaEntriesWithRelationalFields(mediaProps: {entries: Honk.Media.BasicLibraryEntry['entries'], metaArtistIds: (number|null)[], metaCategoryIds: (number|null)[], coverId: number, mediaType: Honk.Media.BasicLibraryEntry['type']}) {
		const mediaEntryIds: number[] = [];

		try {
			for await (const entry of mediaProps.entries) {
				await this.insertSingleMediaEntryRow(
						MediaFactory.mediaEntryToDbMediaEntry({
							title: entry.title,
							absUrl: entry.filename,
							coverImgId: mediaProps.coverId,
							mediaType: mediaProps.mediaType
						})
					)
					.then(function(rowId){
						if (typeof(rowId) == 'number') {
							mediaEntryIds.push(rowId);
						}
						return rowId
					})
					.then(async (mediaId)=>{
						if (typeof(mediaId) == 'number') {
							const longestMetaIdList = (
								mediaProps.metaArtistIds.length >= mediaProps.metaCategoryIds.length
									? 'metaArtistIds' : 'metaCategoryIds'
							)
							for (let i = 0; i < mediaProps[longestMetaIdList].length; i++) {
								await MediaMetaModel.insertNewMediaMetaRelationRow(mediaId, mediaProps.metaCategoryIds[i], mediaProps.metaArtistIds[i]);
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
