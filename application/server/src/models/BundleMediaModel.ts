import { Model } from 'objection';
import { MediaModel } from './MediaModel';
// import { MetaModel } from './MetaModel';
import { BaseHonkModel } from './_ModelBase';
import { BundlesModel } from './BundlesModel';
import { BundlesMediaModelColumns } from './_ModelDefinitions';

export class BundleMediaModel extends BaseHonkModel implements BundlesMediaModelColumns {

	/** Table name is the only required property. */
	static get tableName() {
        return `${BundlesModel.tableName}_${MediaModel.tableName}`
    };

	id: number = null!;
	bundle_id: number = null!;
    media_id: number = null!;
    media_index?: number | null = null!;

	static async mountBundleMediaTable() {
        await this.mountTable(this.tableName, (table)=> {
			table.increments('id');
            table.integer('bundle_id').notNullable().references('id').inTable(BundlesModel.tableName);
            table.integer('media_id').notNullable().references('id').inTable(MediaModel.tableName);
			table.integer('media_index');
        });
        await this.knex().schema.alterTable(this.tableName, (table)=> {
            table.unique(['media_id','bundle_id','media_index']);
        });
	}

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'bundle_id', 'media_id' ],
			properties: {
				bundle_id: { type: 'integer' },
				media_id: { type: 'integer' },
				media_index: { type: ['integer', 'null'] }
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
			bundles: {
				relation: Model.HasManyRelation,
				modelClass: BundlesModel,
				join: {
					from: `${BundlesModel.tableName}.id`,
					to: `${this.tableName}.bundle_id`
				}
			}
		}
	}

	static getRowsByMediaId(params: { mediaIds: number[] }) {
		const { mediaIds } = params;
		return (
			this.query()
				.select()
				.whereRaw("media_id = " + mediaIds.map(_ => '?').join(' OR media_id = '), [...mediaIds])
		)
	}

    static async insertBundleMediaRelationRow(bundleMedia: { bundleId: number, mediaId: number, mediaIndex: number | null }) {
        try {
			const doesBundleExist = await (
				BundleMediaModel
					.query()
					.select()
					.where('bundle_id', bundleMedia.bundleId)
					.andWhere('media_id', bundleMedia.mediaId)
					.andWhere('media_index', bundleMedia.mediaIndex)
			);
			if (doesBundleExist.length == 0) {
				await (
					this.query()
						.insert({
							bundle_id: bundleMedia.bundleId,
							media_id: bundleMedia.mediaId,
							media_index: bundleMedia.mediaIndex
						})
						// .whereNot(bundleMediaRelationshipRow)
						// .onConflict(['media_id','bundle_id','media_index'])
						// .ignore()
						.catch(err=>console.log(err))
				)
			}
        } catch (err) {
            console.log(err)
			// console.log({...bundleMedia})
        }
    }

}
