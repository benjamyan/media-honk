import { MediaHonkServerBase } from "../../_Base";

export class ModelService extends MediaHonkServerBase {
    constructor() {
        super();
        
    }

    /**
     * @method formatInsertValues Formats sqlite row data for insert/update
     * @param valuesToFormat An _object_ type whos values are to be formatted for the table row
     * @returns The same object shape, except the value are formatted lol
     */
    public formatInsertValues(valuesToFormat: any) {
        return Object.values(valuesToFormat).map((value, index)=>{
            switch (typeof value) {
                case 'number':
                case 'string': {
                    return `'${value}'`
                }
                case 'boolean': {
                    return value ? 1 : 0
                }
                case 'object': {
                    if (Array.isArray(value)) {
                        return (
                            value.length > 0 
                                ? `'${value.join(', ')}'` 
                                : "'UNKNOWN'"
                        )
                    } else if (value === null) {
                        return "'NULL'";
                    }
                    return `'UNKNOWN_OBJECT_ERR:${Object.keys(valuesToFormat)[index]}'`;
                }
                default: {
                    return value;
                }
            }
        })
    }
    
    /** 
     * @method insertUniqueEntry Util function for generating and running unique insert statements
     * @param tableName A valid name in the schema for the table to be insert against
     * - The table needs to have a _single_ `UNIQUE` entry upon creation
     * @param valuesToInsert 
     * - An object containing the key value pairs relative to the table
     * - The keys must match the tables expected columns
     * @returns `number | Error`
     * - The number of changes the query made to the table
     * - A SQLite or unhandled error 
     */
    public insertUniqueEntry(tableName: string, valuesToInsert: any): Promise<true | Error> {
        return new Promise((resolve, reject)=>{
            try {
                this.db
                    .insert(valuesToInsert)
                    .into(tableName)
                    .then(()=>{
                        resolve(true)
                    })
                    .catch((err)=>{
                        return reject(err)
                    })
                // this.db.run(
                //     `INSERT OR IGNORE INTO ${tableName} ( ${Object.keys(valuesToInsert).join(', ')} ) VALUES ( ${this.formatInsertValues(valuesToInsert).join(', ')} )`,
                //     function(error) {
                //         if (error !== null) {
                //             return reject(error)
                //         };
                //         return resolve(this.changes)
                //     });
            } catch (err) {
                return reject(err instanceof Error ? err : new Error(`Unhandled exception. ModelService.insertUniqueEntry`));
            }
        })
    }

}