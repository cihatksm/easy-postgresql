interface ProcedureResult {
    status: number;
    message: string;
    data: any[] | any | null;
}
interface ProcedureReference {
    [key: string]: any;
}
/**
 * Executes a stored procedure/function in the database.
 *
 * @param procedureName - The name of the stored procedure/function
 * @param reference - The input parameters for the procedure
 * @param useRecordsets - If true, wraps rows in array; otherwise returns rows directly
 * @returns Promise<ProcedureResult>
 */
export declare const executeProcedure: (procedureName: string, reference?: ProcedureReference, useRecordsets?: boolean) => Promise<ProcedureResult>;
export {};
