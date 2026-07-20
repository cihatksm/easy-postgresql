"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeProcedure = void 0;
const connect_to_server_1 = require("./connect_to_server");
const config_1 = require("./config");
const log_1 = require("./log");
function pgTypeOf(value) {
    if (value === null || value === undefined)
        return 'text';
    if (typeof value === 'number')
        return Number.isInteger(value) ? 'integer' : 'float8';
    if (typeof value === 'boolean')
        return 'boolean';
    if (value instanceof Date)
        return 'timestamp';
    if (Buffer.isBuffer(value))
        return 'bytea';
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
const executeProcedure = async (procedureName, reference = {}, useRecordsets = false) => {
    try {
        const keys = Object.keys(reference);
        const values = keys.map(k => reference[k]);
        const params = keys.map((_, i) => `"${keys[i]}" := $${i + 1}`).join(", ");
        const queryText = `SELECT * FROM ${procedureName}(${params})`;
        const pool = (0, connect_to_server_1.getPool)();
        const client = await pool.connect();
        try {
            const result = await client.query(queryText, values);
            const data = useRecordsets ? [result.rows] : result.rows;
            return { status: 200, message: 'Success', data };
        }
        finally {
            client.release();
        }
    }
    catch (err) {
        if (config_1.config.get.logingMode()) {
            (0, log_1.log)('Procedure', procedureName, err instanceof Error ? err.message : String(err));
        }
        return { status: 500, message: 'Error', data: null };
    }
};
exports.executeProcedure = executeProcedure;
//# sourceMappingURL=procedure_execute.js.map