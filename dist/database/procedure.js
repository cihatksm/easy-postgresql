"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Procedure = Procedure;
const procedure_execute_1 = require("../operations/procedure_execute");
const data_types_1 = require("../operations/data_types");
const config_1 = require("../operations/config");
const query_1 = require("./query");
const log_1 = require("../operations/log");
/**
 * All functions in the procedure are defined in this class.
 *
 * @param name - The name of the procedure to be added to the procedure
 * @returns Object containing procedure methods
 */
function Procedure(name = '') {
    /**
     * Returns information about the procedure in the database.
     * @returns Promise<ProcedureInfo | null> - Information about the procedure
     */
    async function Info() {
        if (!name)
            return null;
        const queryString = `SELECT routine_name FROM information_schema.routines WHERE routine_type = 'FUNCTION' AND routine_schema = 'public' AND LOWER(routine_name) = LOWER($1)`;
        const queryOutput = await (0, query_1.Query)(queryString, [name]);
        if (queryOutput?.status !== 200) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Procedure', 'Info', `The ${name} procedure not found.`);
            return null;
        }
        const data = queryOutput?.data?.[0] || null;
        if (!data)
            return null;
        return {
            name: data.routine_name,
            type: 'Function',
            date: null
        };
    }
    /**
     * Returns information about all procedures in the database.
     * @returns Promise<ProcedureInfo[] | null> - Information about all procedures
     */
    async function AllInfo() {
        const queryString = `SELECT routine_name FROM information_schema.routines WHERE routine_type = 'FUNCTION' AND routine_schema = 'public'`;
        const queryOutput = await (0, query_1.Query)(queryString);
        if (queryOutput?.status !== 200) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Procedure', 'All Info', 'Procedures not found.');
            return null;
        }
        const data = queryOutput?.data || [];
        if (!data)
            return null;
        return data.map(m => ({
            name: m.routine_name,
            type: 'Function',
            date: null
        }));
    }
    /**
     * Gets the output schema of the procedure in the database.
     * @returns Promise<Record<string, string>> - The output schema of the procedure
     */
    async function SimpleOutput() {
        if (!name)
            return {};
        return {};
    }
    /**
     * Executes the procedure in the database
     *
     * @param reference - The reference parameters to be executed in the database
     * @param useRecordsets - If true, returns result?.recordsets; otherwise returns result?.recordset (default: false)
     * @returns Promise<ProcedureResult> - The result of the procedure execution
     */
    async function Execute(reference = {}, useRecordsets = false) {
        let procedureOutput = await (0, procedure_execute_1.executeProcedure)(name, reference, useRecordsets);
        if (procedureOutput?.status !== 200) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Procedure', 'Execute', `The ${name} procedure could not be executed.`);
            return { status: 501, message: 'The procedure could not be executed.', data: [] };
        }
        let data = procedureOutput?.data || null;
        if (Array.isArray(data) && data.length > 0 && useRecordsets == false) {
            const schema = await SimpleOutput();
            if (schema && Object.keys(schema).length > 0) {
                data = data.map(m => {
                    const keys = Object.keys(m);
                    if (keys.length !== Object.keys(schema).length)
                        return null;
                    const new_data = {};
                    keys.forEach(key => new_data[key] = data_types_1.sqlTypes[schema[key]](m[key]));
                    return new_data;
                }).filter(f => f !== null);
            }
        }
        procedureOutput.data = data;
        return procedureOutput;
    }
    return {
        Execute,
        Info,
        AllInfo,
        SimpleOutput
    };
}
//# sourceMappingURL=procedure.js.map