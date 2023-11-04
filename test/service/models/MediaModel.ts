import { Model } from 'objection';
import { Constants } from '../config';
// import { MediaHonkServerBase } from '../_Base';
import { CoversModel } from './CoversModel';
import { MediaMetaModel } from './MediaMetaModel';
import { MetaModel } from './MetaModel';
import {ModelBase} from './_ModelBase';
import { MediaModelColumns } from './_ModelDefinitions';
import { StoredMediaTypes, ResolvedMediaAssetProperties } from '../types/MediaProperties';

export class MediaModel extends ModelBase implements MediaModelColumns {

	/** Table name is the only required property. */
	static tableName = 'media';
	static mediaMetaRelationTableName = `${this.tableName}_${MetaModel.tableName}`;

	id: number = null!;
	title: string = null!;
	abs_url: string = null!;
	cover_img_id?: number = null!;
	media_type: StoredMediaTypes = null!;
	
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
				cover_img_id: { type: ['integer', 'null'] },
				media_type: { type: 'string' }
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

	static async insertSingleMediaEntryRow(mediaEntry: Omit<MediaModelColumns, 'id'>): Promise<number | null> {
		let mediaEntryId: number | null = null!;
		
		try {
			const foundMediaEntry = await (
				this.query()
					.select()
					.where('abs_url', mediaEntry.abs_url)
			);
			if (foundMediaEntry.length > 0) {
				return foundMediaEntry[0].id
			}
			await (
				this.query()
					.insert(mediaEntry)
					.onConflict([ 'abs_url' ])
					.ignore()
					// .merge()
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
			// MediaHonkServerBase.emitter(
			// 	'error', 
			// 	err instanceof Error ? err : new Error('Unhandled exception. MediaModel.insertSingleMediaEntryRow()')
			// );
		}
		return mediaEntryId
	}
	
	/**
	 * 
	 * @param mediaProps 
	 * @returns An array of tuples where _tuple[0]_ is the `index` attribute of a media entry, and _tuple[1]_ is the row ID in the `media` table
	 */
	static async insertMediaEntriesWithRelationalFields(mediaProps: { entries: ResolvedMediaAssetProperties['entries'], metaArtistIds: (number|null)[], metaCategoryIds: (number|null)[], coverId?: number, mediaType: StoredMediaTypes}) {
		const mediaEntryIds: number[] = [];

		try {
			for await (const entry of mediaProps.entries) {
				await this.insertSingleMediaEntryRow({
						title: entry.title,
						abs_url: entry.filename,
						cover_img_id: mediaProps.coverId,
						media_type: mediaProps.mediaType
					})
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
