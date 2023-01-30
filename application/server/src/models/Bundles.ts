import { Model } from 'objection';
import { Default } from './_Default';

export class Bundles extends Default {
	static tableName = 'bundles';

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	 */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'main_title' ],

			properties: {
				id: { type: 'integer' },
				main_title: { type: 'text' },
				sub_title: { type: ['text', 'null'] },
				cover_img_id: { type: ['integer', 'null'] }
			}
		};
	}  
	
	/** This object defines the relations to other models. 
	 * @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-relationmappings
	 */
	static get relationMappings() {
		return {
			cover: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./Covers'), 
				join: {
					from: 'bundles.cover_img_id',
					to: 'covers.id'
				}
			},
			media: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./Media'),
				join: {
				  from: 'bundles.id',
				  through: {
					from: 'bundle_media.bundle_id',
					to: 'bundle_media.media_id'
				  },
				  to: 'media.id'
				}
			},
			// sources: {
			// 	relation: Model.ManyToManyRelation,
			// 	modelClass: require('./Covers'), // Covers,
			// 	join: {
			// 		from: 'media.cover_img_id',
			// 		to: 'covers.id'
			// 	}
			// },
			// meta: {
			// 	relation: Model.ManyToManyRelation,
			// 	modelClass: require('./Meta'), // Meta,
			// 	join: {
			// 	  from: 'media.id',
			// 	  // ManyToMany relation needs the `through` object
			// 	  // to describe the join table.
			// 	  through: {
			// 		// If you have a model class for the join table
			// 		// you need to specify it like this:
			// 		// modelClass: PersonMovie,
			// 		from: 'media_meta.media_id',
			// 		to: 'media_meta.meta_id'
			// 	  },
			// 	  to: 'meta.id'
			// 	}
			// },
			// relativeUrl: {
			// 	relation: Model.HasManyRelation,
			// 	modelClass: Media,
			// 	join: {
			// 			from: 'media.rel_url_id',
			// 			to: 'media.id'
			// 	}
			// },
		}
	}
}
