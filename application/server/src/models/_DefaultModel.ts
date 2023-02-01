import { Model } from 'objection';
// import { default as Mysql } from 'mysql2';

// const connection = Mysql.createConnection({
// 	host: mysql.host,
// 	port: mysql.port,
// 	user: mysql.username,
// 	password: mysql.password,
// 	database: mysql.db_name,
// 	insecureAuth: mysql.allow_insecure
// });
// Model.require('knex')

/** 
 * - https://vincit.github.io/objection.js/api/model/ 
 * - https://github.com/knex/knex
 * */
export class DefaultHonkModel extends Model {
	// Each model must have a column (or a set of columns) that uniquely
	// identifies the rows. The column(s) can be specified using the `idColumn`
	// property. `idColumn` returns `id` by default and doesn't need to be
	// specified unless the model's primary key is something else.
	static get idColumn() {
		return 'id';
	}
}
