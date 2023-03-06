import { Model } from 'objection';
import { CoversModel } from './CoversModel';
import { MetaModel } from './MetaModel';
import { SourcesModel } from './SourcesModel';
import {BaseHonkModel} from './_ModelBase';

export class MediaModel extends BaseHonkModel {

	/** Table name is the only required property. */
	static tableName = 'media';

	title: string = null!;
	filename: string = null!;
	rel_url: string = null!;
	cover_img_id: number = null!;

	static async mountMediaTable() {
		try {
			await this.mountTable(this.tableName, (table)=> {
				table.increments('id').primary();
				table.string('title').notNullable().unique();
				table.string('abs_url').notNullable().unique();
				// table.string('rel_url');
				// table.integer('rel_url_id').references('id');
				table.integer('cover_img_id').references('id').inTable(CoversModel.tableName);
				// table.integer('source_id').references('id').inTable(SourcesModel.tableName);
			});
			await this.mountTable(`${this.tableName}_${MetaModel.tableName}`, (table)=> {
				table.integer('media_id').notNullable().references('id').inTable(this.tableName);
				table.integer('meta_id').notNullable().references('id').inTable(MetaModel.tableName);
			});
		} catch (err) {
			//
		}
	}

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
				title: { type: 'string' },
				abs_url: { type: ['string', 'null'] },
				// filename: { type: 'string' },
				// rel_url: { type: ['string', 'null'] },
				// rel_url_id: { type: ['integer', 'null'] },
				cover_img_id: { type: ['integer', 'null'] },
				// source_id: { type: [ 'integer' ] }

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
				modelClass: require('./SourcesModel'), // Sources,
				join: {
					from: 'media.source_id',
					to: 'sources.id'
				}
			},
			sources: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./CoversModel'), // Covers,
				join: {
					from: 'media.cover_img_id',
					to: 'covers.id'
				}
			},
			meta: {
				relation: Model.ManyToManyRelation,
				modelClass: require('./MetaModel'), // MetaModel,
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
				modelClass: require('./BundlesModel'), // BundlesModel,
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
				modelClass: MediaModel,
				join: {
						from: 'media.rel_url_id',
						to: 'media.id'
				}
			},
		}
	}

	static async insertSingleMediaEntryRow(mediaEntryProps: any) {

	}

	static async insertManyMediaEntryRows(entriesProps: Pick<Parameters<typeof this.insertMediaEntriesWithRelationalFields>[0], 'entries' | 'coverId'>) {
		console.log(entriesProps)
	}

	static async insertMediaEntriesWithRelationalFields(mediaProps: {entries: Honk.Media.BasicLibraryEntry['entries'], metaRowIds: number[], coverId: number}) {
		// console.log(mediaProps)
	}

}
