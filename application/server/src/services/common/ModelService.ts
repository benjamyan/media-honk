import { MediaHonkServerBase } from "../../_Base";

let ModelServiceIntermediary: ModelService = null!;

export class ModelService extends MediaHonkServerBase {
    private constructor() {
        super();
        
    }

    static get instance() {
        if (ModelServiceIntermediary === null) {
            ModelServiceIntermediary = new ModelService();
        }
        return ModelServiceIntermediary
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
                                : "'X'"
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
                // this.db
                //     .insert(valuesToInsert)
                //     .into(tableName)
                //     .then(()=>{
                //         resolve(true)
                //     })
                //     .catch((err)=>{
                //         return reject(err)
                //     })
            } catch (err) {
                return reject(err instanceof Error ? err : new Error(`Unhandled exception. ModelService.insertUniqueEntry`));
            }
        })
    }

    /**
     * @method handleTableEntryComparison
     * @description A generic utility fn to compare entries in the DB against the `comparisonData` provided. If an entry does not exist, it will call `INSERT INTO` and append to the DB.
     * @param param0 
     * - `tableName` an explicit table name in the database
     * - `comparisonKey` is an singular and explicit key of the database table to compare the query results
     * - `comparisonData` is an implicitely defined set of data to compare the values of the select result against
     * - `factoryCallback` should be a handler function for a `comparisonData` entry to be formatted for insertion into the datbase 
     */
    // public async handleTableEntryComparison<K extends keyof Honk.DB.Schema, X extends Honk.DB.Schema[K] extends (infer U)[] ? U : Honk.DB.Schema[K]>({ 
    //     tableName, comparisonKey, comparisonData, factoryCallback 
    // }: {
    //     tableName: K,
    //     comparisonKey: keyof X,
    //     comparisonData: Record<string, any>,
    //     factoryCallback: (dataKey: string)=> any;
    // }) {
    //     try {
    //         // await (
    //         //     this.db
    //         //         .select(comparisonKey as string)
    //         //         .from(tableName)
    //         //         .then(async (selectRes: Array<X>)=> {
    //         //             let currentOperationResult: Awaited<ReturnType<typeof this.insertUniqueEntry>>;
    //         //             for (const path in comparisonData) {
    //         //                 if (selectRes.some((queryValue)=>queryValue[comparisonKey] === comparisonData[path])) {
    //         //                     continue;
    //         //                 }
    //         //                 // Convert this to use `insertMany` API
    //         //                 currentOperationResult = await this.insertUniqueEntry(tableName, factoryCallback(path));
    //         //                 if (currentOperationResult instanceof Error) {
    //         //                     throw currentOperationResult;
    //         //                 }
    //         //             }
    //         //         })
    //         //         .catch(err=>{
    //         //             this.emit('error', {
    //         //                 error: err,
    //         //                 severity: 2
    //         //             })
    //         //         })
    //         // );
    //     } catch (err) {
    //         this.emit('error', {
    //             error: err,
    //             severity: 1
    //         })
    //     }
    // }

}