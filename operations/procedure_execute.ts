import { getPool } from './connect_to_server';
import { config } from './config';
import { log } from './log';

interface ProcedureResult {
    status: number;
    message: string;
    data: any[] | any | null;
}

interface ProcedureReference {
    [key: string]: any;
}

function pgTypeOf(value: any): string {
    if (value === null || value === undefined) return 'text';
    if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float8';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'timestamp';
    if (Buffer.isBuffer(value)) return 'bytea';
    return 'text';
}

/**
 * Executes a stored procedure/function in the database.
 *
 * @param procedureName - The name of the stored procedure/function
 * @param reference - The input parameters for the procedure
 * @param useRecordsets - If true, wraps rows in array; otherwise returns rows directly
 * @returns Promise<ProcedureResult>
 */
export const executeProcedure = async (
    procedureName: string,
    reference: ProcedureReference = {},
    useRecordsets: boolean = false
): Promise<ProcedureResult> => {
    try {
        const keys = Object.keys(reference);
        const values = keys.map(k => reference[k]);
        const params = keys.map((_, i) => `$${i + 1}::${pgTypeOf(values[i])}`).join(', ');
        const queryText = `SELECT * FROM ${procedureName}(${params})`;

        const pool = getPool();
        const client = await pool.connect();
        try {
            const result = await client.query(queryText, values);
            const data = useRecordsets ? [result.rows] : result.rows;
            return { status: 200, message: 'Success', data };
        } finally {
            client.release();
        }
    } catch (err) {
        if (config.get.logingMode()) {
            log('Procedure', procedureName, err instanceof Error ? err.message : String(err));
        }
        return { status: 500, message: 'Error', data: null };
    }
};
