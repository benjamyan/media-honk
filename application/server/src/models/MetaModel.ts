import { default as knex } from 'knex';
import { Model, QueryBuilder, raw, ref } from 'objection';
import { MetaModelColumns } from '.';
import { AtleastOneOf } from '../types/utils';
import { MediaHonkServerBase } from '../_Base';
import {BaseHonkModel} from "./_ModelBase";
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

	static async getAssociatedRowsByValue(params: { column: keyof Pick<MetaModelColumns, 'artist_name' | 'category_name'>, value: string }) {
		const { column, value } = params;
		const initialMetaColumn = this.query().select('id').where(column, value);
		return (
			this.query()
				.select()
				.where('id', initialMetaColumn)
				.orWhere(this.associatedColumn(column), initialMetaColumn)
		)
	}

	static getAssociatedColumnsById(params: GetRowMethodProps & { metaQuery: ()=> QueryBuilder<MetaModel, MetaModel[]> }) {
		let { column, includeRefs, metaQuery } = params;

		const releventRows = ()=> (
			this.query()
				.select('id')
				.from('meta')
				.whereIn('id', metaQuery().select('id'))
				.orWhereIn('artist_id', metaQuery().select('id'))
				.orWhereIn('category_id', metaQuery().select('id'))
		);
		const totalRows = ()=> {
			const qb = this.query()
			if (includeRefs?.includes('category_name')) {
				qb.select('category_id').from('meta').whereIn('id', releventRows())
			}
			if (includeRefs?.includes('artist_name')) {
				qb.select('artist_id').from('meta').whereIn('id', releventRows())
			}

			return qb // this.query().select('category_id').from('meta').whereIn('id', releventRows())
		};
		
		return ()=> (
			this.query()
				.select(column || [])
				.whereIn('id', totalRows())
				.orWhereIn('id', releventRows())
		)
	}

	static getRowsById(params: GetRowMethodProps & { metaQuery: ()=> QueryBuilder<MetaModel, MetaModel[]> }) {
		let { artist, category, metaQuery, column } = params;
		// if (column == undefined) column = [];
		// if (column.length == 0) column = ['id','artist_id','artist_name','category_id','category_name'];
		console.log()

		return ()=> (
			this.query()
				.select(column || [])
				.modify((qb) => {
					if (!!artist) {
						qb.where('artist_id', metaQuery().select('id'));
						qb.orWhere('id', `curr.artist_id`);
					}
					if (!!category) {
						if (!!artist) qb.orWhere('category_id', metaQuery().select('id'));
						else qb.where('category_id', metaQuery().select('id'));
						qb.orWhere('id', `curr.category_id`)
					}
					return qb
				})
				.unionAll(function() {
					this.select(column || []).from(metaQuery());
				})
		)
	}

	static getRowsByColumn(params: GetRowMethodProps) {
		let { artist, category, column } = params;
		// if (column == undefined) column = [];
		// if (column.length == 0) column = ['id','artist_id','artist_name','category_id','category_name'];
		const rowsByColumn = ()=> (
			this.query()
				.column(params.includeRefs ? [] : (column || []))
				.select()
				.modify((qb)=> {
					if (!!artist) {
						qb.where('artist_name', artist)
					};
					if (!!category) {
						if (!artist) {
							qb.where('category_name', category)
						} else {
							qb.orWhere('category_name', category)
						}
					}
					return qb;
				})
		)
		if (!params.includeRefs) {
			return rowsByColumn
		}
		return this.getAssociatedColumnsById({ 
			...params, 
			metaQuery: rowsByColumn 
		});
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
		let insertValues: {
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
								} else if (selectedMetaRows.length == 1) {
									return metaRowId = selectedMetaRows[0].id;
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
		const { artists, categories } = metaEntries;
		const newMetaRowIds: Record<keyof typeof metaEntries, number[]> & {
			mutate: (value: number | null) => void;
		} = {
			artists: [],
			categories: [],
			mutate(value) {
				if (value == null) return;
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
			// const newMetaRowIds: Awaited<ReturnType<typeof this.insertSingleMetaRow>>[] = [];
			await metaEntries[longValueKey].reduce(async (initialPromise, value)=> {
				await initialPromise;
				for await (const element of (longValueKey === 'artists' ? categories : artists)) {
					if (longValueKey === 'artists') {
						await this.insertSingleMetaRow(value, element).then((rowId)=>{
							newMetaRowIds.mutate(rowId);
						})
						// await this.insertSingleMetaRow(value, element).then((rowId)=>newMetaRowIds.push(rowId))
					} else {
						await this.insertSingleMetaRow(element, value).then((rowId)=>{
							newMetaRowIds.mutate(rowId);
						})
						// await this.insertSingleMetaRow(element, value).then((rowId)=>newMetaRowIds.push(rowId))
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

}
