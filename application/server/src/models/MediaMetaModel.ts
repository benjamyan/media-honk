import { Model } from 'objection';
import { MediaModel } from './MediaModel';
import { MetaModel } from './MetaModel';
import { BaseHonkModel } from './_ModelBase';

export class MediaMetaModel  extends BaseHonkModel {

	/** Table name is the only required property. */
	static get tableName() {
        return `${MediaModel.tableName}_${MetaModel.tableName}`
    };

    media_id: number = null!;
    meta_id: number = null!;

	static async mountMediaMetaTable() {
        await this.mountTable(this.tableName, (table)=> {
            table.integer('media_id').notNullable().references('id').inTable(MediaModel.tableName);
            table.integer('meta_id').notNullable().references('id').inTable(MetaModel.tableName);
        });
        await this.knex().schema.alterTable(this.tableName, (table)=> {
            table.unique(['media_id', 'meta_id']);
        });
	}

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'media_id', 'meta_id' ],
			properties: {
				media_id: { type: 'integer' },
				meta_id: { type: 'integer' }
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
				modelClass: MediaModel,
				join: {
					from: `${MediaModel.tableName}.id`,
					to: `${this.tableName}.media_id`
				}
			},
			meta: {
				relation: Model.HasManyRelation,
				modelClass: MetaModel,
				join: {
					from: `${MetaModel.tableName}.id`,
					to: `${this.tableName}.meta_id`
				}
			}
		}
	}

    static async insertNewMediaMetaRelationRow(mediaId: number, metaId: number) {
        try {
            this.query()
                .insert({
                    media_id: mediaId,
                    meta_id: metaId
                })
                .onConflict(['media_id', 'meta_id'])
                .ignore()
                .catch(err=>console.log(err))
        } catch (err) {
            console.log(err)
        }
    }

}
