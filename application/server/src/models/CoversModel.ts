import { Model } from 'objection';
import {BaseHonkModel} from './_BaseModel';

export class CoversModel extends BaseHonkModel {
	static tableName = 'covers';

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'id','file_url','source_id' ],
			properties: {
				id: { type: 'integer' },
				file_url: { type: 'text' },
				source_id: { type: 'integer' }
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
				modelClass: require('./MediaModel'),
				join: {
					from: 'covers.id',
					to: 'media.cover_img_id'
				}
			},
			source: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./SourcesModel'),
				join: {
					from: 'covers.source_id',
					to: 'sources.id'
				}
			},
			// media: {
			// 	relation: Model.ManyToManyRelation,
			// 	modelClass: require('./Media'),
			// 	join: {
			// 		from: 'meta.id',
			// 		through: {
			// 			from: 'media_meta.meta_id',
			// 			to: 'media_meta.media_id'
			// 		},
			// 		to: 'media.id'
			// 	}
			// },
		}
	}
}
