import { Model } from 'objection';
import {BaseHonkModel} from "./_BaseModel";

type MetaRowContentProps = Record<'artist_name' | 'category_name', any[]>

export class MetaModel extends BaseHonkModel {

	/** Table name is the only required property. */
	static tableName = 'meta';

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			oneOf: [
				{ required: [ 'artist_name' ] },
				{ required: [ 'artist_id' ] },
				{ required: [ 'category_name' ] },
				{ required: [ 'category_id' ] }
			],
			minProperties: 1,
			properties: {
				id: { type: 'integer' },
				artist_name: { type: ['text', 'null'] },
				artist_id: { type: ['integer', 'null'] },
				category_name: { type: ['text', 'null'] },
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
	
	// static metaRowContent(values: MetaRowContentProps): Promise<string[] | Error> | Error {
	// 	try {
	// 		const valuesParsed = Object.keys(values);
	// 		const queryValues = {
	// 			columns: (
	// 				valuesParsed.length === 0
	// 					? [ 'artist_name', 'category_name' ]
	// 					: valuesParsed
	// 			)
	// 		}
	// 		return new Promise((resolve, reject)=> (
	// 			MetaModel
	// 				.query()
	// 				.columns(queryValues.columns)
	// 				// .select()
	// 				.where((col)=>{
	// 					return col. !== 'NULL'
	// 				})
	// 				// .whereNot(row, `NULL`)
	// 				.then((res: any)=>{
	// 					resolve(res.map((meta: any)=>meta[row]))
	// 					return 
	// 				})
	// 				.catch((err)=>{
	// 					reject(new Error(JSON.stringify(err)))
	// 					return 
	// 				})
	// 		));
	// 	}
	// 	catch (err) {
	// 		return err instanceof Error ? err : new Error('Unhandled exception.')
	// 	}
	// }
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

}
