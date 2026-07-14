"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const connect_to_server_1 = require("../operations/connect_to_server");
const config_1 = require("../operations/config");
const log_1 = require("../operations/log");
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
function convertNamedToPositional(query, inputs) {
    const paramRegex = /@(\w+)/g;
    const params = [];
    let match;
    while ((match = paramRegex.exec(query)) !== null) {
        if (!params.includes(match[1])) {
            params.push(match[1]);
        }
    }
    let text = query;
    params.forEach((param, i) => {
        const type = pgTypeOf(inputs[param]);
        text = text.replace(new RegExp(`@${param}\\b`, 'g'), `$${i + 1}::${type}`);
    });
    const values = params.map(p => inputs[p] !== undefined ? inputs[p] : null);
    return { text, values };
}
/**
 * Executes a raw SQL query with optional parameterized inputs.
 *
 * @param query - The SQL query to execute. Use @paramName for named parameters or $1, $2 for positional.
 * @param inputs - Optional key/value map of named parameters (Record) or ordered values array
 * @returns Promise<QueryResult>
 */
const Query = async (query, inputs) => {
    try {
        let text;
        let values;
        if (Array.isArray(inputs)) {
            text = query;
            values = inputs;
        }
        else if (inputs && typeof inputs === 'object') {
            const converted = convertNamedToPositional(query, inputs);
            text = converted.text;
            values = converted.values;
        }
        else {
            text = query;
            values = [];
        }
        const pool = (0, connect_to_server_1.getPool)();
        const client = await pool.connect();
        try {
            const result = await client.query(text, values);
            return { status: 200, message: 'Success', data: result.rows || null };
        }
        finally {
            client.release();
        }
    }
    catch (err) {
        if (config_1.config.get.logingMode()) {
            (0, log_1.log)('Query', null, `${query} : ${err instanceof Error ? err.message : String(err)}`);
        }
        return { status: 500, message: String(err), data: null };
    }
};
exports.Query = Query;
//# sourceMappingURL=query.js.map