import Objection, { Model } from 'objection';
import { default as Express } from 'express';
import { Constants } from '../config';
import { MediaHonkServerBase } from '../_Base';
import { BundleMediaModel } from './BundleMediaModel';
import { CoversModel } from './CoversModel';
import { MediaModel } from './MediaModel';
import { MetaModel } from './MetaModel';
import {BaseHonkModel} from './_ModelBase';
import { MediaMetaModel } from './MediaMetaModel';
import { BundlesModelColumns } from './_ModelDefinitions';
import { ResolvedMediaAssetProperties, StoredMediaTypes } from '../types/MediaProperties';

export class BundlesModel extends BaseHonkModel implements BundlesModelColumns {
	static tableName = 'bundles';

	id: number = null!;
	main_title: string = null!;
	sub_title: string = null!;
	custom_cover_id?: number = null!;
	media_type: StoredMediaTypes = null!;
	
	static async mountBundlesTable() {
		await this.mountTable(this.tableName, (table)=> {
			table.increments('id');
			table.string('main_title').notNullable();
			table.string('sub_title');
			table.string('custom_cover_id').references('id').inTable('covers');
			table.string('media_type').notNullable().checkBetween(Constants.databaseMediaTypes);
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
				custom_cover_id: { type: ['integer', 'null'] },
				// cover_img_id: { type: ['integer', 'null'] },
				// media_type: {
				// 	type: ['string', 'null'],
				// 	enum: ['VU','VS','AU','AS','IU','IS' ]
				// 	// : ['VU','VS','AU','AS','IU','IS']
				// }
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
			// media: {
			// 	relation: Model.ManyToManyRelation,
			// 	modelClass: require('./MediaModel'),
			// 	join: {
			// 	  from: 'bundles.id',
			// 	  through: {
			// 		from: 'bundles_media.bundle_id',
			// 		to: 'bundles_media.media_id'
			// 	  },
			// 	  to: 'media.id'
			// 	}
			// }
		}
	}
	
	$parseJson(json: Objection.Pojo) {
		// Remember to call the super class's implementation.
		json = super.$formatDatabaseJson(json);

		if (json.sub_title === undefined) {
			json.sub_title = null;
		}

		// if (!json.media_type || !Constants.databaseMediaTypes.includes(json.media_type)) {
		// 	switch (json.media_type) {
		// 		case 'movie': {
		// 			json.media_type = 'VU';
		// 			break;
		// 		}
		// 		case 'series': {
		// 			json.media_type = 'VS';
		// 			break;
		// 		}
		// 		case 'gallery': {
		// 			json.media_type = 'IS';
		// 			break;
		// 		}
		// 		case 'album': {
		// 			json.media_type = 'AS';
		// 			break;
		// 		}	
		// 		case 'singles': {
		// 			json.media_type = 'AU';
		// 			break;
		// 		}	
		// 		default: {
		// 			json.media_type = null;
		// 			// TODO parse the entries associated with this bundle and determine the media type
		// 		}
		// 	}
		// }
		
		return json;
	}

	static async getBundlesByMeta(params: Pick<Express.Request['query'], 'artist' | 'category'>) {
		try {
			const metaParamId = ()=> (
				MetaModel
					.query()
					.select('id')
					.where('artist_name', '=', params.artist as string)
			);
			const metaId = ()=> (
				MetaModel.query()
					.select('id')
					.where('artist_name', '=', params.artist as string)
					.orWhere('artist_id', '=', metaParamId())
			);
			const mediaMetaId = async ()=> (
				MediaMetaModel
					.query()
					.select('media_id')
					.where('meta_artist_id', '=', metaId())
			);
			const mediaIdList = await (
				mediaMetaId()
					.then((res)=>res.map(row=>row.media_id))
			)
			const bundleMediaId = ()=> (
				BundleMediaModel
					.query()
					.select()
					.whereRaw("media_id = " + mediaIdList.map(_ => '?').join(' OR media_id = '), [...mediaIdList])
					.then((res)=>res.map((row)=>row.bundle_id))
			);
			return await BundlesModel.query().findByIds(await bundleMediaId())
		} catch (err) {
			console.log(err)
		}
	}

	static async insertSingleBundleRow(bundleRowContent: Pick<ResolvedMediaAssetProperties, 'title' | 'subtitle' | 'type'>): Promise<number | null> {
		let newBundleRowId: number | null = null!;
		try {
			await (
				this.query()
					.select()
					.where('main_title', '=', bundleRowContent.title)
					.skipUndefined()
					.then(async (selectResult)=>{
						if (selectResult.length > 0) {
							const matchingRowIndex = selectResult.findIndex(
								(row)=> row.sub_title === (bundleRowContent.subtitle || null)
							);
							if (matchingRowIndex > -1) {
								return newBundleRowId = selectResult[matchingRowIndex].id;
							}
						}
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
			)
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message)
			} else {
				console.log(err)
			}
		}
		return newBundleRowId
	}
	
	static async handleBundleEntryWithRelatedFields(mediaEntry: ResolvedMediaAssetProperties) {
		// MediaHonkServerBase.logger(`- PROCESSING bundle for ${mediaEntry.title} ${mediaEntry.subtitle || ''}`)
		let { coverUrl, artists, categories } = mediaEntry;
		let coverRowId: number = -1,
			bundleRowId: number = -1,
			metaRowIds: Awaited<ReturnType<typeof MetaModel.insertManyMetaRows>> = {
				artists: [],
				categories: []
			},
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
						if (insertMetaResult !== undefined) {
							metaRowIds.artists = insertMetaResult.artists.reduce((acc, current)=>{
								if (!acc.includes(current)) acc.push(current);
								return acc;
							}, [] as number[])
							metaRowIds.categories = insertMetaResult.categories.reduce((acc, current)=>{
								if (!acc.includes(current)) acc.push(current);
								return acc;
							}, [] as number[])
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
					entries: mediaEntry.entries.filter(
						(entry)=> entry.filename !== coverUrl
					),
					metaArtistIds: metaRowIds.artists,
					metaCategoryIds: metaRowIds.categories,
					coverId: coverRowId,
					mediaType: mediaEntry.type
				})
				.then(insertedMediaEntries=>{
					if (Array.isArray(insertedMediaEntries)) {
						mediaEntryRowIds = insertedMediaEntries;
					}
				});
				
			for await (const mediaId of mediaEntryRowIds) {
				await BundleMediaModel.insertBundleMediaRelationRow({
					bundleId: bundleRowId,
					mediaId,
					mediaIndex: mediaEntryRowIds.findIndex(id=> id === mediaId)
				})
			}
			
        } catch (err) {
			if (err instanceof Error) {
				console.log(err.message);
			} else {
				console.log(err);
			}
        }
		// console.log(' - DONE 2')
		return;
	}

}
