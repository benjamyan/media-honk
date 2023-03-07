import Objection, { Model } from 'objection';
import { Constants } from '../config';
import { MediaHonkServerBase } from '../_Base';
import { BundleMediaModel } from './BundleMediaModel';
import { CoversModel } from './CoversModel';
import { MediaModel } from './MediaModel';
import { MetaModel } from './MetaModel';
import {BaseHonkModel} from './_ModelBase';

export class BundlesModel extends BaseHonkModel {
	static tableName = 'bundles';

	id: number = null!;
	main_title: string = null!;
	sub_title: string = null!;
	media_type: string | null = null!;
	// cover_img_id: number = null!;

	static async mountBundlesTable() {
		await this.mountTable(this.tableName, (table)=> {
			table.increments('id');
			table.string('main_title').notNullable();
			table.string('sub_title');
			/** 
				VU = video unique (movie) 
				VS = video series (episodes)
				AU = audio unique (singles)
				AS = audio series (album)
				GU = gallery unique (singles)
				GS = gallery series (ebook)
			*/
			table.string('media_type')// .checkBetween(['VU','VS','AU','AS','IU','IS']);
			// table.integer('cover_img_id').references('id').inTable('covers');
		})
		await this.knex().schema.alterTable(this.tableName, (table)=> {
			table.unique(['main_title', 'sub_title']);
		});
	}

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	 */
	static get jsonSchema() {
		return {
			type: 'object',
			title: 'Bundle',
			required: [ 'main_title' ],
			properties: {
				id: { type: 'integer' },
				main_title: { type: 'string' },
				sub_title: { type: ['string', 'null'] },
				// cover_img_id: { type: ['integer', 'null'] },
				media_type: {
					type: ['string', 'null'],
					enum: ['VU','VS','AU','AS','IU','IS' ]
					// : ['VU','VS','AU','AS','IU','IS']
				}
			}
		};
	}  
	
	/** This object defines the relations to other models. 
	 * @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-relationmappings
	 */
	static get relationMappings() {
		return {
			// cover: {
			// 	relation: Model.ManyToManyRelation,
			// 	modelClass: require('./CoversModel'), 
			// 	join: {
			// 		from: 'bundles.cover_img_id',
			// 		to: 'covers.id'
			// 	}
			// },
			media: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./MediaModel'),
				join: {
				  from: 'bundles.id',
				  through: {
					from: 'bundle_media.bundle_id',
					to: 'bundle_media.media_id'
				  },
				  to: 'media.id'
				}
			}
		}
	}
	
	$parseJson(json: Objection.Pojo) {
		// Remember to call the super class's implementation.
		json = super.$formatDatabaseJson(json);

		if (json.sub_title === undefined) {
			json.sub_title = null;
		}

		if (!json.media_type || !Constants.databaseMediaTypes.includes(json.media_type)) {
			switch (json.media_type) {
				case 'movie': {
					json.media_type = 'VU';
					break;
				}
				case 'series': {
					json.media_type = 'VS';
					break;
				}
				case 'gallery': {
					json.media_type = 'IS';
					break;
				}
				case 'album': {
					json.media_type = 'AS';
					break;
				}	
				case 'singles': {
					json.media_type = 'AU';
					break;
				}	
				default: {
					json.media_type = null;
					// TODO parse the entries associated with this bundle and determine the media type
				}
			}
		}
		
		return json;
	}

	static async insertSingleBundleRow(bundleRowContent: Pick<Honk.Media.BasicLibraryEntry, 'title' | 'subtitle' | 'type'>): Promise<number | null> {
		let newBundleRowId: number | null = null!;
		try {
			await (
				this.query()
					.select()
					.where('main_title', '=', bundleRowContent.title)
					.then(async (selectResult)=>{
						// if (bundleRowContent.title.indexOf('uturama') > -1) {
						// 	console.log(selectResult)
						// 	console.log(bundleRowContent)
						// }
						if (selectResult.length > 0) {
							const matchingRowIndex = selectResult.findIndex(
								(row)=>row.sub_title === (bundleRowContent.subtitle || null)
							);
							if (matchingRowIndex > -1) {
								return newBundleRowId = selectResult[0].id;
							}
						}
						// if (bundleRowContent.title.indexOf('uturama') > -1) {
						// 	console.log('insert!')
						// }
						await (
							this.query()
								.insert({
									main_title: bundleRowContent.title,
									sub_title: bundleRowContent.subtitle,
									media_type: bundleRowContent.type
								})
								.onConflict(['main_title', 'sub_title'])
								.ignore()
								.then((bundleInsertResult)=>{
									if (bundleInsertResult.id !== 0) {
										return newBundleRowId = bundleInsertResult.id;
									}
								})
								.catch(err=>{
									console.log(err)
								})
						)
					})
					// .catch(err=> {
					// 	MediaHonkServerBase.emitter('error', err);
					// 	return undefined;
					// })
			)
			// await (
			// 	this.query()
			// 		.insert({
			// 			main_title: bundleRowContent.title,
			// 			sub_title: bundleRowContent.subtitle,
			// 			// cover_img_id: bundleRowContent.coverRowId,
			// 			media_type: bundleRowContent.type
			// 		})
			// 		.onConflict(['main_title'])
			// 		.ignore()
			// 		.then(async (bundleInsertResult)=>{
			// 			console.log('\n')
			// 			console.log(bundleInsertResult)
			// 			if (bundleInsertResult.id !== 0) {
			// 				return newBundleRowId = bundleInsertResult.id;
			// 			}
			// 			await (
			// 				this.query()
			// 					.select()
			// 					.where('main_title', '=', bundleRowContent.title)
			// 					.then((selectResult)=>{
			// 						console.log(selectResult)
			// 						if (selectResult.length > 0) {
			// 							newBundleRowId = selectResult[0].id
			// 						}
			// 					})
			// 			)
			// 		})
			// 		.catch(err=> {
			// 			MediaHonkServerBase.emitter('error', err);
			// 			return undefined;
			// 		})
			// )
		} catch (err) {
			console.log(err)
		}
		return newBundleRowId
	}
	
	static async handleBundleEntryWithRelatedFields(mediaEntry: Honk.Media.BasicLibraryEntry, options?: Record<string, any>) {
		let { coverUrl, artists, categories } = mediaEntry;
		let coverRowId: number = -1,
			bundleRowId: number = -1,
			metaRowIds: number[] = [],
			mediaEntryRowIds: Awaited<ReturnType<typeof MediaModel.insertMediaEntriesWithRelationalFields>> = [];
        try {
            if (coverUrl) {
                await CoversModel.insertCoverEntry(coverUrl).then(newCoverId=>{
					if (typeof(newCoverId) === 'number') {
						coverRowId = newCoverId;
					}
				});
            }
            if (artists || categories) {
				await MetaModel.insertManyMetaRows({
						artists: artists || [],
						categories: categories || []
					})
					.then(insertMetaResult=>{
						// console.log(insertMetaResult)
						if (Array.isArray(insertMetaResult)) {
							metaRowIds = insertMetaResult;
						}
					})
            }

			await this.insertSingleBundleRow({
					title: mediaEntry.title,
					subtitle: mediaEntry.subtitle,
					type: mediaEntry.type
				})
				.then(newBundleRowId=>{
					if (typeof(newBundleRowId) === 'number') {
						bundleRowId = newBundleRowId;
					}
				});
			await MediaModel.insertMediaEntriesWithRelationalFields({
					entries: mediaEntry.entries.filter((entry)=>{
						// console.log(entry)
						return entry.filename !== coverUrl
					}),
					metaRowIds: metaRowIds,
					coverId: coverRowId
				})
				.then(insertedMediaEntries=>{
					if (Array.isArray(insertedMediaEntries)) {
						mediaEntryRowIds = insertedMediaEntries;
					}
				});

			// if (bundleRowId === -1) {
			// 	console.log({...mediaEntry})
			// 	throw new Error(`Unable to set row with value of -1`);
			// }
			/**
			 * @todo 
			 * - running into where promises arent fulfilling and leaving some entries dangling, and then added on second aggregation. see entry 'Gallery 2' for example
			 * - bug where some bundles are adding media items that are not present, but relevent based on title/subtitle mismatch - see 'Futurama/season-2'
			 * - the second aggregation causes both of the above.
			 */
			for await (const mediaId of mediaEntryRowIds) {
				// console.log(bundleRowId)
				if (mediaEntry.title.indexOf('futurama') > -1) {
					console.log({...mediaEntry})
				}
				await BundleMediaModel.insertBundleMediaRelationRow({
					bundleId: bundleRowId,
					mediaId,
					mediaIndex: mediaEntryRowIds.findIndex(id=> id === mediaId)
				})
			}
			
        } catch (err) {
            console.log(err);
        }
		// console.log(' - DONE 2')
		return;
	}

}
