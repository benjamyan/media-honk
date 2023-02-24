import { ModelService } from "./common/ModelService";

export class AggregateService extends ModelService {

    constructor() {
        super();
        
    }
    
    /**
     * @method createDatabaseBackup will write a backup of the current database to the file system. 
     * @description Backup will be the database name appended with the time and date, with an extension of `.bak.db`
     */
    public createDatabaseBackup() {
        
    }
    
    /**
     * @method handleTableEntryAggregate
     * @param param0 
     * - `tableName` an explicit tables name in the database
     * - `comparisonKey` is an singular and explicit key of the database table to compare the query results
     * - `comparisonData` is an implicitely defined set of data to compare the values of the select result against
     * - `factoryCallback` should be a handler function for a `comparisonData` entry to be formatted for insertion into the datbase 
     */
    public handleTableEntryAggregate<K extends keyof Honk.DB.Schema, X extends Honk.DB.Schema[K] extends (infer U)[] ? U : Honk.DB.Schema[K]>({ 
        tableName, comparisonKey, comparisonData, factoryCallback 
    }: {
        tableName: K,
        comparisonKey: keyof X,
        comparisonData: Record<string, any>,
        factoryCallback: (dataKey: string)=> any;
    }) {
        try {
            this.db
                .select(comparisonKey as string)
                .from(tableName)
                .then(async (selectRes: Array<X>)=> {
                    let currentOperationResult: Awaited<ReturnType<typeof this.insertUniqueEntry>>;
                    for (const path in comparisonData) {
                        if (selectRes.some((queryValue)=>queryValue[comparisonKey] === comparisonData[path])) {
                            continue;
                        }
                        currentOperationResult = await this.insertUniqueEntry(tableName, factoryCallback(path));
                        if (currentOperationResult instanceof Error) {
                            throw currentOperationResult;
                        }
                    }
                })
                .catch(err=>{
                    this.emit('error', {
                        error: err,
                        severity: 2
                    })
                });
        } catch (err) {
            this.emit('error', {
                error: err,
                severity: 1
            })
        }
    }

}

// type DerivedSchema<T extends Honk.DB.Schema = Honk.DB.Schema, K extends keyof T = keyof T> = (
//     // K extends keyof T ? { tagName: K } & Partial<T[K]> : never
//     K extends keyof T 
//         ? T[K] extends (infer U)[] 
//             ? U
//             : T[K]
//         : never
// );

// export interface AggreateFunctionPropsBase {
//     /** Table name in the database to be queried against */
//     tableName: keyof Honk.DB.Schema;
//     /** 
//      * - Data that should be evaluated against the resutling select statement on the above table
//      * - Calls a `SELECT * FROM _tableName_` query and returns an array of those values for comparison
//      */
//     comparisonData: DerivedSchema;
//     /**
//      * The keys to be compared. Key __must__ be shared between the `table` and the `comparisonData`
//      */
//     comparisonKey: keyof DerivedSchema;
//     /** If we need to overwrite the data */
//     overwrite?: boolean;
//     /** Factory function to take the provided data and format it for insert. Must return an object that will validate on insert */
//     factoryCallback: (dataKey: string)=> any;
// }
// interface SourceEntryAggregateProps extends AggreateFunctionPropsBase {

// }
