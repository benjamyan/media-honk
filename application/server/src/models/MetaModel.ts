import { Model } from 'objection';
import { MediaHonkServerBase } from '../_Base';
import {BaseHonkModel} from "./_ModelBase";

type MetaRowContentProps = Record<'artist_name' | 'category_name', any[]>

export class MetaModel extends BaseHonkModel {

	/** Table name is the only required property. */
	static tableName = 'meta';

	/** Type guard */
	id: number = null!;
	artist_name: string | null = null!;
	artist_id: number | null = null!;
	category_name: string | null = null!;
	category_id: number | null = null!;
	
	static async mountMetaTable() {
		await this.mountTable(this.tableName, (table)=> {
			table.increments('id');
			table.string('artist_name').unique();
			table.integer('artist_id').references('id').inTable(this.tableName);
			table.string('category_name').unique();
			table.integer('category_id').references('id').inTable(this.tableName);
		});
		await this.knex().schema.alterTable(this.tableName, (table)=> {
			table.unique(['artist_name', 'category_name']);
			table.unique(['artist_id','category_name']);
			table.unique(['artist_name','category_id']);
			table.unique(['artist_id','category_id']);
		})
	}
	
	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			// oneOf: [
			// 	{ required: [ 'artist_name' ] },
			// 	{ required: [ 'artist_id' ] },
			// 	{ required: [ 'category_name' ] },
			// 	{ required: [ 'category_id' ] }
			// ],
			// minProperties: 1,
			properties: {
				id: { type: 'integer' },
				artist_name: { type: ['string', 'null'] },
				artist_id: { type: ['integer', 'null'] },
				category_name: { type: ['string', 'null'] },
				category_id: { type: ['integer', 'null'] }
			}
		};
	}

	/** This object defines the relations to other models. 
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-relationmappings
	*/
	static get relationMappings() {
		return {
			artist: {
				relation: Model.ManyToManyRelation,
				modelClass: MetaModel,
				join: {
					from: 'meta.artist_id',
					to: 'meta.id'
				}
			},
			category: {
				relation: Model.ManyToManyRelation,
				modelClass: MetaModel,
				join: {
					from: 'meta.catgory_id',
					to: 'meta.id'
				}
			},
			media: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./MediaModel'),
				join: {
					from: 'meta.id',
					through: {
						from: 'media_meta.meta_id',
						to: 'media_meta.media_id'
					},
					to: 'media.id'
				}
			},
		}
	}
	

    static metaRowContent(row: 'artist_name' | 'category_name'): Promise<string[] | Error> | Error {
        try {
            return new Promise((resolve, reject)=> (
                this.query()
                    .whereNot(row, `NULL`)
                    .select(row)
                    .then((res: any)=>{
                        resolve(res.map((meta: any)=>meta[row]))
                        return 
                    })
                    .catch((err)=>{
                        reject(new Error(JSON.stringify(err)))
                        return 
                    })
            ));
        }
        catch (err) {
            return err instanceof Error ? err : new Error('Unhandled exception.')
        }
    }

	static async insertSingleMetaRow(artist: string | null, category: string | null) {
		let conflictArr: string[] = [],
			insertValues: {
				artist_name: string | null,
				artist_id: number | null,
				category_name: string | null,
				category_id: number | null
			} = {
				artist_name: artist,
				artist_id: null,
				category_name: category,
				category_id: null
			},
			metaRowId: number = 0;
		try {
			if (!!insertValues.artist_name) {
				await (
					this.query()
						.select()
						.whereNotNull('artist_name')
						.andWhere('artist_name', '=', insertValues.artist_name)
						.then(result=>{
							if (result.length > 0) {
								insertValues.artist_name = null;
								insertValues.artist_id = result[0].id;
							} else {
								conflictArr.push('artist_name')
							}
						})
				)
			}
			if (!!insertValues.category_name) {
				await (
					this.query()
						.select()
						.whereNotNull('category_name')
						.andWhere('category_name', '=', insertValues.category_name)
						.then(result=>{
							if (result.length > 0) {
								insertValues.category_name = null;
								insertValues.category_id = result[0].id;
							} else {
								conflictArr.push('category_name');
							}
						})
				)
			}
			
			if (insertValues.artist_id !== null || insertValues.category_id !== null) {
				if (insertValues.artist_id === insertValues.category_id) {
					return insertValues.artist_id
				}
			}
			await (
				this.query()
					.select()
					.where(insertValues)
					.orWhereNotNull('artist_id')
					.andWhere('artist_id', '=', insertValues.artist_id)
					.orWhereNotNull('category_id')
					.andWhere('category_id', '=', insertValues.category_id)
					// .whereNotExists(
					// 	this.query()
					// 		.select('*')
					// 		.where({
					// 			id: insertValues.artist_id,
					// 			category_id: insertValues.category_id
					// 		})
					// 		.orWhere({
					// 			id: insertValues.category_id,
					// 			artist_id: insertValues.artist_id
					// 		})
					// )
					.then(async (result)=>{
						if (result.length > 0 ) {
							if (!!insertValues.artist_id && !!insertValues.category_id) {
								// if (insertValues.artist_id == 13 && insertValues.category_id === 1) {
								// 	console.log(result)
								// 	console.log({...insertValues})
								// }

								const superfluousResult = result.find((row)=>row.category_name === category || row.artist_name === artist);
								if (superfluousResult) {
									return metaRowId = superfluousResult.id;
								}
							}
						}
						await (
							this.query()
								.insert(insertValues)
								.onConflict([ 'artist_name', 'category_name' ])
								.ignore()
								.then(insertedMetaRow=>{
									return metaRowId = insertedMetaRow.id;
								})
						);
					})
			)
		} catch (err) {
			// console.log(err)
			// MediaHonkServerBase.emitter('error', {
			// 	error: new Error('Failed insert or select. MetaModel.insertSingleRow()'),
			// 	severity: 2
			// });
		}
		return metaRowId
	}

	static async insertManyMetaRows(metaEntries: { artists: string[], categories: string[] }) {
		try {
			const { artists, categories } = metaEntries;
			const longValueKey = (
				artists.length >= categories.length ? 'artists' : 'categories'
			);
			const newMetaRowIds: Awaited<ReturnType<typeof this.insertSingleMetaRow>>[] = [];
			
			// let promiseArr: Promise<any>[] = [];
			
			await metaEntries[longValueKey].reduce(async (initialPromise, value)=> {
				await initialPromise;
				for await (const element of (longValueKey === 'artists' ? categories : artists)) {
					if (longValueKey === 'artists') {
						await this.insertSingleMetaRow(value, element)
					} else {
						await this.insertSingleMetaRow(element, value)
					}
				}
				// promiseArr = [];
				// await Promise.all(
				// 	longValueKey === 'artists'
				// 		? categories.map(async (category)=> await this.insertSingleMetaRow(value, category).then(()=> { return }))
				// 		: artists.map(async (artist)=> await this.insertSingleMetaRow(artist, value).then(()=> { return }))
				// ).then(()=> { return });
				// await Promise.all(promiseArr);
			}, Promise.resolve());
			
			return newMetaRowIds as number[];
		} catch (err) {
			// console.log(err)
			// MediaHonkServerBase.emitter('error', {
			// 	error: new Error('Failed generic insert. MetaModel.insertManyMetaRows()'),
			// 	severity: 2
			// })
		}
		
	}

}
