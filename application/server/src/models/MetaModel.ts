import { Model } from 'objection';
import { MediaHonkServerBase } from '../_Base';
import { MediaModel } from './MediaModel';
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
			}
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

	/**
	 * @method insertSingleMetaRow
	 * @description 
	 * - Helper function to insert single rows containg both artist and category. 
	 * - Will reference the database and check if one of the parameters provided are already present
	 * - If one (or both) are, theyll be referenced instead and appended to the row as an ID
	 * - If a row containg both (either string or ID value) exists, its ID will be returned and an insert will not be performed
	 * @todo
	 * - Optimize the query. Currently running multiple selects before the insert
	 * @param artist `string | null` 
	 * @param category `string | null` 
	 * @returns Either the insrted rows ID or the existing rows ID that matches the given parameters
	 */
	static async insertSingleMetaRow(artist: string | null, category: string | null) {
		let /*conflictArr: string[] = [],*/
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
			metaRowId: number = null!;
		try {
			// await (
			// 	this.query()
			// 		.select()
			// 		.modify(function(qb){
			// 			if (!!insertValues.artist_name) {
			// 				qb.whereNotNull('artist_name').andWhere('artist_name', '=', insertValues.artist_name)
			// 			}
			// 			if (!!insertValues.category_name) {
			// 				if (!!insertValues.artist_name) {
			// 					qb.orWhereNotNull('category_name').andWhere('category_name', '=', insertValues.category_name)
			// 				} else {
			// 					qb.whereNotNull('category_name').andWhere('category_name', '=', insertValues.category_name)
			// 				}
			// 			}
			// 		})
			// 		.then(result=>{
			// 			if (result.length === 1) {
			// 				if (result[0].artist_name === insertValues.artist_name && result[0].category_name === insertValues.category_name) {
			// 					metaRowId = result[0].id;
			// 				}
			// 			} else if (result.length > 0) {
			// 				insertValues.artist_id = (
			// 					result.find((row)=>row.artist_name === insertValues.artist_name)?.id || null
			// 				);
			// 				insertValues.category_id = (
			// 					result.find((row)=>row.category_name === insertValues.category_name)?.id || null
			// 				);
			// 			}
			// 			console.log({...insertValues})
			// 		})
			// 		.then(async ()=> {
			// 			console.log({...insertValues})
			// 			if (metaRowId !== null) {
			// 				return metaRowId;
			// 			} else if (insertValues.artist_id !== null && insertValues.artist_id === insertValues.category_id) {
			// 				return metaRowId = insertValues.artist_id;
			// 			}
			// 			await (
			// 				this.query()
			// 					.select()
			// 					.where(insertValues)
			// 					.orWhereNotNull('artist_id')
			// 					.andWhere('artist_id', '=', insertValues.artist_id)
			// 					.orWhereNotNull('category_id')
			// 					.andWhere('category_id', '=', insertValues.category_id)
			// 					.then(async (selectedMetaRows)=>{
			// 						if (selectedMetaRows.length > 0 && !!insertValues.artist_id && !!insertValues.category_id) {
			// 							/** 
			// 							 * If both the artist and category ID have been defined on the current row to be inserted
			// 							 * then it is possible were adding a self-referencing field for either the artist or category.
			// 							 * Compare the string values for either artist or category from the select result, and 
			// 							 * return its ID if it passed filtering.
			// 							 */
			// 							const superfluousResult = selectedMetaRows.find(
			// 								(meta)=> meta.category_name === category || meta.artist_name === artist
			// 							);
			// 							if (superfluousResult) {
			// 								metaRowId = superfluousResult.id;
			// 							}
			// 						}
			// 					})
			// 			);
			// 		})
			// 		.then(async ()=>{
			// 			if (metaRowId !== null) {
			// 				return metaRowId;
			// 			}
			// 			await (
			// 				this.query()
			// 					.insert(insertValues)
			// 					.onConflict([ 'artist_name', 'category_name' ])
			// 					.ignore()
			// 					.then(insertedMetaRow=>{
			// 						metaRowId = insertedMetaRow.id;
			// 					})
			// 			);
			// 		})
			// )

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
								// conflictArr.push('artist_name')
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
								// conflictArr.push('category_name');
							}
						})
				)
			}
			
			if (insertValues.artist_id !== null || insertValues.category_id !== null) {
				if (insertValues.artist_id === insertValues.category_id) {
					/** Odd edge case where IDs were duplicating; just return a single ID and go no further */
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
					.then(async (selectedMetaRows)=>{
						if (selectedMetaRows.length > 0 ) {
							if (!!insertValues.artist_id && !!insertValues.category_id) {
								/** 
								 * If both the artist and category ID have been defined on the current row to be inserted
								 * then it is possible were adding a self-referencing field for either the artist or category.
								 * Compare the string values for either artist or category from the select result, and 
								 * return its ID if it passed filtering.
								 */
								const superfluousResult = selectedMetaRows.find(
									(meta)=> meta.category_name === category || meta.artist_name === artist
								);
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
			if (!(err instanceof Error) || (err as Error).name !== 'UniqueViolationError') {
				/** Expect UniqueViolations since were using .ignore() above. Ignore them and move on */
				MediaHonkServerBase.emitter('error', {
					error: err instanceof Error ? err : new Error('Unhandled exception. MetaModel.insertSingleRow()'),
					severity: 2
				});
			}
		}
		return metaRowId
	}

	/**
	 * @method insertManyMetaRows
	 * @description Method will take two given arrays that are permitted datatypes in the meta table. Will loop through the longest array, and on each iteration loop through the other array, assigning the values necessary to call `insertSingleMetaRow`.
	 * @param metaEntries Object containing both `artists` and `categories` as string arrays.
	 * @returns An index containing the newly inserted _or_ already present row IDs  
	 */
	static async insertManyMetaRows(metaEntries: { artists: string[], categories: string[] }) {
		try {
			const { artists, categories } = metaEntries;
			const longValueKey = (
				artists.length >= categories.length ? 'artists' : 'categories'
			);
			const newMetaRowIds: Awaited<ReturnType<typeof this.insertSingleMetaRow>>[] = [];
			
			await metaEntries[longValueKey].reduce(async (initialPromise, value)=> {
				await initialPromise;
				for await (const element of (longValueKey === 'artists' ? categories : artists)) {
					if (longValueKey === 'artists') {
						await this.insertSingleMetaRow(value, element).then((rowId)=>newMetaRowIds.push(rowId))
					} else {
						await this.insertSingleMetaRow(element, value).then((rowId)=>newMetaRowIds.push(rowId))
					}
				}
			}, Promise.resolve());
			
			return newMetaRowIds as number[];
		} catch (err) {
			// console.log(err)
			MediaHonkServerBase.emitter('error', {
				error: err instanceof Error ? err :new Error('Unhandled exception. MetaModel.insertManyMetaRows()'),
				severity: 2
			})
		}
		
	}

}
