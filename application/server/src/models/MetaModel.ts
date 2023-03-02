import { Model } from 'objection';
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

	static async insertMetaEntry(rowContent: { artistName: string|null, categoryName: string|null }) {
		const artistId = await (
			!!rowContent.artistName
				? this.query()
					// .select('id')
					.where({
						artist_name: rowContent.artistName
					})
					.then((result)=>{
						if (result.length > 0) {
							return result[0].id
						}
						return null
					})
				: null
		);
		const categoryId = await (
			!!rowContent.categoryName
				? this.query()
					// .select('id')
					.where({
						category_name: rowContent.categoryName
					})
					.then((result)=>{
						if (result.length > 0) {
							return result[0].id
						}
						return null
					})
				: null
		);
		await this.query()
			.insert({
				artist_name: artistId === null ? rowContent.artistName : null,
				artist_id: artistId,// === null ? undefined : artistId,
				category_name: categoryId === null ? rowContent.categoryName : null,
				category_id: categoryId, //=== null ? undefined : categoryId
				// category_name: rowContent.categoryName
			})
			.onConflict(['artist_name', 'category_name'])
			.ignore()
			.then((result)=>{
				console.log(result)
			})
			.catch(err=>{
				console.log(err)
			})
			// .insert({
			// 	category_name: rowContent.categoryName
			// })
			// .where('artist_name', '=', rowContent.artistName)
			
	}

}
