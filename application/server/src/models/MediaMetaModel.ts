import { Model } from 'objection';
import { MediaModel } from './MediaModel';
import { MetaModel } from './MetaModel';
import { BaseHonkModel } from './_ModelBase';
import { MediaMetaModelColumns, MetaModelColumns } from './_ModelDefinitions';

export class MediaMetaModel  extends BaseHonkModel implements MediaMetaModelColumns {

	/** Table name is the only required property. */
	static get tableName() {
        return `${MediaModel.tableName}_${MetaModel.tableName}`
    };

	id: number = null!;
    media_id: number = null!;
	meta_artist_id?: number | null = null!;
	meta_category_id?: number | null = null!;
    // meta_id: number = null!;

	static async mountMediaMetaTable() {
        await this.mountTable(this.tableName, (table)=> {
			table.increments('id');
            table.integer('media_id').notNullable().references('id').inTable(MediaModel.tableName);
            table.integer('meta_artist_id').references('id').inTable(MetaModel.tableName);
            table.integer('meta_category_id').references('id').inTable(MetaModel.tableName);
        });
        // await this.mountTable(this.tableName, (table)=> {
        //     table.integer('media_id').notNullable().references('id').inTable(MediaModel.tableName);
        //     table.integer('meta_artist_id').unique().references('id').inTable(MetaModel.tableName);
        //     table.integer('meta_category_id').unique().references('id').inTable(MetaModel.tableName);
        // });
        await this.knex().schema.alterTable(this.tableName, (table)=> {
            // table.unique(['media_id', 'meta_artist_id']);
            // table.unique(['media_id', 'meta_category_id']);
            table.unique(['media_id', 'meta_artist_id', 'meta_category_id']);
        });
	}

	/** Optional JSON schema. This is not the database schema!
	* @see https://vincit.github.io/objection.js/api/model/static-properties.html#static-jsonschema
	* @see http://json-schema.org/ 
	*/
	static get jsonSchema() {
		return {
			type: 'object',
			required: [ 'media_id' ],
			// oneOf: [
			// 	{ required: [ 'meta_artist_id' ] },
			// 	{ required: [ 'meta_category_id' ] }
			// ],
			properties: {
				id: { type: 'integer' },
				media_id: { type: 'integer' },
				meta_artist_id: { type: ['integer', 'null'] },
				meta_category_id: { type: ['integer', 'null'] }
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
			category_id: {
				relation: Model.HasManyRelation,
				modelClass: MetaModel,
				join: {
					from: `${MetaModel.tableName}.id`,
					to: `${this.tableName}.meta_artist_id`
				}
			},
			artist_id: {
				relation: Model.HasManyRelation,
				modelClass: MetaModel,
				join: {
					from: `${MetaModel.tableName}.id`,
					to: `${this.tableName}.meta_category_id`
				}
			}
		}
	}

	static associatedMetaColumn(metaColumn: keyof Pick<MetaModelColumns, 'artist_id'|'category_id'>) {
		return `meta_${metaColumn}`
		// switch (metaColumn) {
		// 	case 'artist_id': {
		// 		return 'meta_artist_id'
		// 	}
		// 	case 'category_id': {
		// 		return 'meta_category_id'
		// 	}
		// }
	}

	static async getRowsByMetaId(params: { metaCol: keyof Pick<MetaModelColumns, 'artist_id'|'category_id'>, metaIds: number[] }) {
		const { metaCol, metaIds } = params;
		const mediaMetaCol = this.associatedMetaColumn(metaCol);
		const getMediaMetaColByMetaId = (
			MediaMetaModel
				.query()
				.select('media_id')
				.whereRaw(`${mediaMetaCol} = ` + metaIds.map(_ => '?').join(` OR ${mediaMetaCol} = `), [...metaIds])
		);
		return (
			this.query()
				.select()
				.where('media_id', 'in', getMediaMetaColByMetaId)
		)
	}
	
	static async insertNewMediaMetaRelationRow(mediaId: number, metaCategoryId: number | null, metaArtistId: number | null) {
        try {
			if (metaCategoryId == null && metaArtistId == null) {
				return;
			}
			const mediaIdExists = await MediaModel.query().select().findById(mediaId);
			if (mediaIdExists) {
				this.query()
					.insert({
						media_id: mediaId,
						meta_category_id: metaCategoryId,
						meta_artist_id: metaArtistId
					})
					.onConflict(true)
					.ignore()
					.catch(err=>console.log(err));
			}
        } catch (err) {
            console.log(err)
        }
    }
    // static async insertNewMediaMetaRelationRow(mediaId: number, metaId: number) {
    //     try {
    //         this.query()
    //             .insert({
    //                 media_id: mediaId,
    //                 meta_id: metaId
    //             })
    //             .onConflict(['media_id', 'meta_id'])
    //             .ignore()
    //             .catch(err=>console.log(err))
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }

}
