import { Model } from 'objection';
import { MediaHonkServerBase } from '../_Base';
import {BaseHonkModel} from './_ModelBase';
import { CoversModelColumns } from './_ModelDefinitions';
import { $ModelCache } from '../services/cache/ModelCacheService';

export class CoversModel extends BaseHonkModel implements CoversModelColumns {
	static tableName = 'covers';
	
	/** Declarative column  names for type guard */
	id: number = null!;
	file_url: string = null!;
	
	static async mountCoversTable() {
		await this.mountTable(this.tableName, (table)=> {
			table.increments('id').primary();
			table.string('file_url').unique();
		});
	}

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'file_url' ],
			properties: {
				id: { type: 'integer' },
				file_url: { type: 'string' }
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
			}
		}
	}

	static async getCoverImageById(coverImgId: number) {
		const coverCacheEntry = $ModelCache.get('covers', coverImgId);
		let coverImgUrl;
		if (coverCacheEntry) {
			coverImgUrl = coverCacheEntry.file_url;
		} else {
			const coverImage = await this.query().findById(coverImgId);
			if (coverImage) {
				coverImgUrl = coverImage.file_url;
			}
		}
		return coverImgUrl as string;
	}

	static async insertCoverEntry(fileName: string) {
		return await (
			this.query()
				.insert({ file_url: fileName })
				.onConflict('file_url')
				.ignore()
				.then((insertedCover)=> {
					if (insertedCover.id !== undefined && insertedCover.id !== 0) {
						return insertedCover.id;
					}
				})
				.then(async (coverId)=>{
					if (coverId !== undefined) return coverId
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
