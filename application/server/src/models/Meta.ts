import { Model } from 'objection';
import { Default } from "./_Default";

export class Meta extends Default {

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
				modelClass: Meta,
				join: {
					from: 'meta.artist_id',
					to: 'meta.id'
				}
			},
			category: {
				relation: Model.ManyToManyRelation,
				modelClass: Meta,
				join: {
					from: 'meta.catgory_id',
					to: 'meta.id'
				}
			},
			media: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./Media'),
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

	// static get allArtists() {
	// 	return this.query(``);
	// }

}
