import { getPool } from '../operations/connect_to_server';
import { config } from '../operations/config';
import { log } from '../operations/log';

export interface QueryResult {
    status: number;
    message: string;
    data: any[] | null;
}

function pgTypeOf(value: any): string {
    if (value === null || value === undefined) return 'text';
    if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float8';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'timestamp';
    if (Buffer.isBuffer(value)) return 'bytea';
    return 'text';
}

function convertNamedToPositional(query: string, inputs: Record<string, any>): { text: string; values: any[] } {
    const paramRegex = /@(\w+)/g;
    const params: string[] = [];
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
export const Query = async (query: string, inputs?: Record<string, any> | any[]): Promise<QueryResult> => {
    try {
        let text: string;
        let values: any[];

        if (Array.isArray(inputs)) {
            text = query;
            values = inputs;
        } else if (inputs && typeof inputs === 'object') {
            const converted = convertNamedToPositional(query, inputs);
            text = converted.text;
            values = converted.values;
        } else {
            text = query;
            values = [];
        }

        const pool = getPool();
        const client = await pool.connect();
        try {
            const result = await client.query(text, values);
            return { status: 200, message: 'Success', data: result.rows || null };
        } finally {
            client.release();
        }
    } catch (err) {
        if (config.get.logingMode()) {
            log('Query', null, `${query} : ${err instanceof Error ? err.message : String(err)}`);
        }
        return { status: 500, message: String(err), data: null };
    }
};
