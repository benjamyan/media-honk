import { Model } from 'objection';
import { CoversModel } from './CoversModel';
import { MediaModel } from './MediaModel';
import { MetaModel } from './MetaModel';
import {BaseHonkModel} from './_ModelBase';

export class BundlesModel extends BaseHonkModel {
	static tableName = 'bundles';

	main_title: string = null!;
	sub_title: string = null!;
	cover_img_id: number = null!;
	media_type: string = null!;

	static async mountBundlesTable() {
		await this.mountTable(this.tableName, (table)=> {
			table.increments('id').primary();
			table.string('main_title').notNullable().unique();
			table.string('sub_title');
			/** 
				VU = video unique (movie) 
				VS = video series (episodes)
				AU = audio unique (singles)
				AS = audio series (album)
				GU = gallery unique (singles)
				GS = gallery series (ebook)
			*/
			table.string('media_type').notNullable().checkBetween(['VU','VS','AU','AS','IU','IS']);
			table.integer('cover_img_id').references('id').inTable('covers');
		})
		await this.mountTable(`${this.tableName}_${MediaModel.tableName}`, (table)=> {
			table.increments('bundle_id').notNullable().references('id').inTable(this.tableName);
			table.integer('media_id').notNullable().references('id').inTable(MediaModel.tableName);
			table.integer('media_index').unique();
		})
	}

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
				modelClass: require('./CoversModel'), 
				join: {
					from: 'bundles.cover_img_id',
					to: 'covers.id'
				}
			},
			media: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./MediaModel'),
				join: {
				  from: 'bundles.id',
				  through: {
					from: 'bundle_media.bundle_id',
					to: 'bundle_media.media_id'
				  },
				  to: 'media.id'
				}
			}
		}
	}

	static async insertBundleWithRelatedFields(mediaEntry: Honk.Media.BasicLibraryEntry, options?: Record<string, any>) {
		let { coverUrl, artists, categories } = mediaEntry;
        try {
            if (coverUrl) {
                // await CoversModel.insertCoverEntry(coverUrl);
            }
            if (artists || categories) {
				await MetaModel.insertManyMetaRows({
					artists: artists || [],
					categories: categories || []
				})
				
            }
        } catch (err) {
            // console.log(err);
        }
		// console.log(' - DONE 2')
	}

}
