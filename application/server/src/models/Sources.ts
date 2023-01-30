import { Model } from 'objection';
import { Default } from './_Default';

export class Sources extends Default {

	/** Table name is the only required property. */
	static tableName = 'sources';

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'id', 'title', 'abs_url' ],
			properties: {
				id: { type: 'integer' },
				title: { type: 'text' },
				abs_url: { type: 'text' }
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
				modelClass: require('./Media'),
				join: {
					from: 'source.id',
					to: 'media.source_id'
				}
			},
			covers: {
				relation: Model.HasManyRelation,
				modelClass: require('./Covers'),
				join: {
					from: 'source.id',
					to: 'covers.source_id'
				}
			}
		}
	}
}
