import { Model } from 'objection';
import { Default } from './_Default';

export class Media extends Default {

	/** Table name is the only required property. */
	static tableName = 'media';

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	 */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'title', 'filename', 'source_id' ],

			properties: {
				id: { type: 'integer' },
				title: { type: 'text' },
				filename: { type: 'text' },
				rel_url: { type: ['text', 'null'] },
				rel_url_id: { type: ['integer', 'null'] },
				cover_img_id: { type: ['integer', 'null'] },
				source_id: { type: [ 'integer' ] }

				// Properties defined as objects or arrays are
				// automatically converted to JSON strings when
				// writing to database and back to objects and arrays
				// when reading from database. To override this
				// behaviour, you can override the
				// Model.jsonAttributes property.
				// address: {
				// 	type: 'object',
				// 	properties: {
				// 		street: { type: 'string' },
				// 		city: { type: 'string' },
				// 		zipCode: { type: 'string' }
				// 	}
				// }
			}
		};
	}  
	
	/** This object defines the relations to other models. 
	 * @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-relationmappings
	 */
	static get relationMappings() {
		return {
			covers: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./Sources'), // Sources,
				join: {
					from: 'media.source_id',
					to: 'sources.id'
				}
			},
			sources: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./Covers'), // Covers,
				join: {
					from: 'media.cover_img_id',
					to: 'covers.id'
				}
			},
			meta: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./Meta'), // Meta,
				join: {
				  from: 'media.id',
				  // ManyToMany relation needs the `through` object
				  // to describe the join table.
				  through: {
					// If you have a model class for the join table
					// you need to specify it like this:
					// modelClass: PersonMovie,
					from: 'media_meta.media_id',
					to: 'media_meta.meta_id'
				  },
				  to: 'meta.id'
				}
			},
			bundles: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./Bundles'), // Bundles,
				join: {
				  from: 'media.id',
				  through: {
					from: 'bundle_media.media_id',
					to: 'bundle_media.bundle_id'
				  },
				  to: 'bundle.id'
				}
			},
			relativeUrl: {
				relation: Model.HasManyRelation,
				modelClass: Media,
				join: {
						from: 'media.rel_url_id',
						to: 'media.id'
				}
			},
		}
	}
}
