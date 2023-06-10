import { default as knex } from 'knex';
import { Model, QueryBuilder, raw, ref } from 'objection';
import { MediaMetaModel, MetaModelColumns } from '.';
import { AtleastOneOf } from '../types/utils';
import { MediaHonkServerBase } from '../_Base';
import {BaseHonkModel} from "./_ModelBase";
import { $ModelCache } from '../services/cache/ModelCacheService';
/**
	 * 
	 * @param param0 
	 * -
	 * - Requires one of (but accepts both):
	 *     - `artist`
	 *    - `category`
	 * - `includeRefs` include rows that have a reference to the `artist` or `category` (or both)
	 * 
	 * @todo 
	 * - 
	 * - `explicit` if both provided; all rows must have either both the param, or their respective rows ID
	 * 
	 */
type GetRowMethodProps = (
	AtleastOneOf<{artist: string | undefined, category: string | undefined}, 'category' | 'artist'> & { 
		includeRefs?: Array<'category_name' | 'artist_name'>;
		explicit?: boolean; 
		column?: (keyof MetaModel)[]; 
	}
);
// type AssociatedColumn<C extends keyof Omit<MetaModelColumns, 'id'>> = (
//     C extends keyof Pick<MetaModelColumns, 'artist_name' | 'category_name'> 
// 		? keyof Pick<MetaModelColumns, 'artist_id' | 'category_id'> 
// 		: keyof Pick<MetaModelColumns, 'artist_name' | 'category_name'> 
// )
type AssociatedColumn<C extends keyof Omit<MetaModelColumns, 'id'>> = (
    C extends `${'artist'|'category'}_name` ? `${'artist'|'category'}_id` : `${'artist'|'category'}_name`
)

export class MetaModel extends BaseHonkModel implements MetaModelColumns {

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
	
	static associatedColumn<T extends keyof Omit<MetaModelColumns, 'id'>>(column:T) {
		let associatedColumn;
		switch (column) {
			case 'artist_id': {
				associatedColumn = "artist_name";
				break;
			}
			case 'artist_name': {
				associatedColumn = `artist_id`
				break;
			}
			case 'category_id': {
				associatedColumn = 'category_name'
				break;
			}
			case 'category_name': {
				associatedColumn = 'category_id'
				break;
			}
		}
		return associatedColumn as AssociatedColumn<T>
	}
	
	static async getRowIdsByValue(metaColumn: keyof Omit<MetaModelColumns, 'id'>, queryValue: string) {
		const initialMetaRowId = await (
			MetaModel.query().select().where(metaColumn, queryValue).then((foundRow)=> foundRow[0].id)
		);
		if (initialMetaRowId == undefined) {
			return []
		}
		return await (
			MetaModel
				.query()
				.select()
				.where(this.associatedColumn(metaColumn), initialMetaRowId)
				.then((foundMetaRow)=>[
					initialMetaRowId, 
					...foundMetaRow.flatMap(({id})=> id)
				])
		)
	}

	static async getValuesByMediaId(colName: 'artist_name' | 'category_name', mediaIdList: number[]) {
		const mediaMetaColById: Set<number> = new Set();
		const metaTableValues: Set<string> = new Set();
		const metaIdColName = MetaModel.associatedColumn(colName);
		const mediaMetaColName: keyof MediaMetaModel = `meta_${metaIdColName}`;
	
		const modelMediaMetaCache = [...$ModelCache.media_meta.values()];
		let mediaMetaMatchingRows;
		for await (const id of mediaIdList) {
			// this should be a recursive external fn
			mediaMetaMatchingRows = modelMediaMetaCache.filter(({media_id})=>media_id == id)
			if (mediaMetaMatchingRows.length > 0) {
				mediaMetaMatchingRows.forEach((mediaMetaRow)=> {
					if (mediaMetaRow.media_id !== id) return
					mediaMetaColById.add(mediaMetaRow[mediaMetaColName] as number);
				})
			} else {
				await MediaMetaModel.query().select().where('media_id', '=', id).then((MediaMetaRows)=> {
					if (MediaMetaRows.length == 0) return;
					for (const mediaMeta of MediaMetaRows) {
						if (!mediaMeta[mediaMetaColName]) continue;
						mediaMetaColById.add(mediaMeta[mediaMetaColName] as number);
					}
				})
			}
		}
		await MetaModel.query().findByIds([...mediaMetaColById.values()]).then(async (metaRows)=> {
			for await (const metaRow of metaRows) {
				if (metaRow[metaIdColName] !== null) {
					await MetaModel.query().findById(metaRow[metaIdColName] as number).then((row)=>{
						if (row && row[colName]) metaTableValues.add(row[colName] as string);
					})
				} else {
					metaTableValues.add(metaRow[colName] as string)
				}
			}
		});
		return [...metaTableValues.values()];
	}
	
    static getAllMetaRowContent(row: 'artist_name' | 'category_name' | undefined): Promise<Record<string, string[]> | Error> {
		const queryRow = (
			row === undefined 
				? ['artist_name', 'category_name']
				: row
		)
        return new Promise((resolve, reject)=> (
			MetaModel.query()
				.select(queryRow)
				.skipUndefined()
				.then((res: MetaModel[])=>{
					const parsedQueryResults: Record<string, string[]> = {};
					const setQueryResult = (rowName: string, value: string)=> {
						if (parsedQueryResults[rowName] == undefined) {
							parsedQueryResults[rowName] = []
						}
						parsedQueryResults[rowName].push(value)
					}
					for (const row of res) {
						if (Array.isArray(queryRow)) {
							if (row.artist_name !== null) setQueryResult('artist_name', row.artist_name)
							if (row.category_name !== null) setQueryResult('category_name', row.category_name)
						} else {
							if (row[queryRow] !== null) setQueryResult(queryRow, row[queryRow] as string)
						}
					}
					resolve(parsedQueryResults);
					return 
				})
				.catch((err)=>{
					console.log(err)
					reject(new Error(JSON.stringify(err)))
					return 
				})
		));
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
		// let insertValues: Omit<MetaModelColumns, 'id'> = {
		// 		artist_name: artist,
		// 		artist_id: null,
		// 		category_name: category,
		// 		category_id: null
		// 	},
		// 	metaRowId: number = null!;
		try {
			const foundMetaRows: Record<number, MetaModelColumns> = {};
			const metaInsertRows: Omit<MetaModelColumns, 'id'> = {
				artist_id: artist == null ? null : await (
					this.query().select().first().whereNotNull('artist_name').andWhere('artist_name', artist).then((row)=> {
						if (row == undefined) return null;
						foundMetaRows[row.id] = {...row}
						return row.id
					})
				),
				category_id: category == null ? null : await (
					this.query().select().first().whereNotNull('category_name').andWhere('category_name', category).then((row)=>{
						if (row == undefined) return null;
						foundMetaRows[row.id] = {...row}
						return row.id
					})
				),
				get artist_name() {
					return this.artist_id == null ? artist : null;
				},
				get category_name() {
					return this.category_id == null ? category : null;
				}
			};
			if (metaInsertRows.artist_id && metaInsertRows.artist_id === metaInsertRows.category_id) {
				/** Dupped rows */
				return metaInsertRows.artist_id
			} else if (metaInsertRows.artist_id && metaInsertRows.category_id) {
				/** This afront to god prevents rows where each ID value references an already defined category/artist combination */
				for (const row of Object.values(foundMetaRows)) {
					if ((row.artist_name == artist && row.category_id == metaInsertRows.category_id) 
						|| (row.category_name == category && row.artist_id == metaInsertRows.artist_id)) {
							return row.id
					}
				}
			}
			return await (
				this.query()
					.select()
					.first()
					.where(metaInsertRows)
					.then(async (foundMetaRows)=> {
						if (foundMetaRows) {
							return foundMetaRows.id
						}
						return await (
							this.query()
								.insert(metaInsertRows)
								.onConflict([ 'artist_name', 'category_name' ])
								.ignore()
								.then(({id})=>id)
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
		// return metaRowId
	}
	
	/**
	 * @method insertManyMetaRows
	 * @description Method will take two given arrays that are permitted datatypes in the meta table. Will loop through the longest array, and on each iteration loop through the other array, assigning the values necessary to call `insertSingleMetaRow`.
	 * @param metaEntries Object containing both `artists` and `categories` as string arrays.
	 * @returns An index containing the newly inserted _or_ already present row IDs  
	 */
	static async insertManyMetaRows(metaEntries: { artists: string[], categories: string[] }) {
		const { artists, categories } = metaEntries;
		const newMetaRowIds: Record<keyof typeof metaEntries, number[]> & {
			mutate: (value: number | never) => void;
		} = {
			artists: [],
			categories: [],
			mutate(value) {
				if (!value) return;
				Object.keys(metaEntries).forEach((name)=> {
					name = name as keyof typeof metaEntries;
					if (metaEntries[name as keyof typeof metaEntries].length > this[name as keyof typeof metaEntries].length) {
						if (value !== null) this[name as keyof typeof metaEntries].push(value);
					}
				})
			}
		};
		try {
			const longValueKey = artists.length >= categories.length ? 'artists' : 'categories';
			await metaEntries[longValueKey].reduce(async (initialPromise, value)=> {
				await initialPromise;
				for await (const element of (longValueKey === 'artists' ? categories : artists)) {
					if (longValueKey === 'artists') {
						await this.insertSingleMetaRow(value, element).then((rowId)=>{
							if (rowId) newMetaRowIds.mutate(rowId);
						})
					} else {
						await this.insertSingleMetaRow(element, value).then((rowId)=>{
							if (rowId) newMetaRowIds.mutate(rowId);
						})
					}
				}
			}, Promise.resolve());
			
		} catch (err) {
			// console.log(err)
			MediaHonkServerBase.emitter('error', {
				error: err instanceof Error ? err :new Error('Unhandled exception. MetaModel.insertManyMetaRows()'),
				severity: 2
			})
		}
		return {
			artists: newMetaRowIds.artists,
			categories: newMetaRowIds.categories
		};
		
	}
	// static async insertManyMetaRows(metaEntries: { artists: (string|null)[], categories: (string|null)[] }) {
	// 	const { artists, categories } = metaEntries;
	// 	const newMetaRowIds: Record<keyof typeof metaEntries, number[]> & {
	// 		mutate: (value: number | null) => void;
	// 	} = {
	// 		artists: [],
	// 		categories: [],
	// 		mutate(value) {
	// 			if (value == null) return;
	// 			Object.keys(metaEntries).forEach((name)=> {
	// 				name = name as keyof typeof metaEntries;
	// 				if (metaEntries[name as keyof typeof metaEntries].length > this[name as keyof typeof metaEntries].length) {
	// 					if (value !== null) this[name as keyof typeof metaEntries].push(value);
	// 				}
	// 			})
	// 		}
	// 	};
	// 	try {
	// 		const valueKeys: Record<string, keyof typeof metaEntries> = {
	// 			shortest: artists.length >= categories.length ? 'categories' : 'artists',
	// 			longest: artists.length >= categories.length ? 'artists' : 'categories'
	// 		}
	// 		await metaEntries[valueKeys.longest].reduce(async (initialPromise, value)=> {
	// 			await initialPromise;
	// 			// const insertingRowEntries = (
	// 			// 	metaEntries[valueKeys.shortest].length == 0
	// 			// 		? [null]
	// 			// 		: metaEntries[valueKeys.shortest]
	// 			// )
	// 			for await (const element of metaEntries[valueKeys.shortest]) {
	// 				if (valueKeys.shortest === 'artists') {
	// 					await this.insertSingleMetaRow(value, element).then((rowId)=>newMetaRowIds.mutate(rowId));
	// 				} else {
	// 					await this.insertSingleMetaRow(element, value).then((rowId)=>newMetaRowIds.mutate(rowId));
	// 				}
	// 			}
	// 		}, Promise.resolve());
	// 	} catch (err) {
	// 		// console.log(err)
	// 		MediaHonkServerBase.emitter('error', {
	// 			error: err instanceof Error ? err :new Error('Unhandled exception. MetaModel.insertManyMetaRows()'),
	// 			severity: 2
	// 		})
	// 	}
	// 	return {
	// 		artists: newMetaRowIds.artists,
	// 		categories: newMetaRowIds.categories
	// 	};
		
	// }

}
