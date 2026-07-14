export interface ParameterizedPieces {
    condition: string;
    inputs: any[];
}

export interface InsertPieces {
    columns: string;
    values: string;
    inputs: any[];
}

/**
 * Converts an object into a parameterized WHERE/SET condition string.
 * Generates $1, $2... positional placeholders to prevent SQL injection.
 *
 * @param data - The key/value pairs to parameterize
 * @param startIndex - Starting positional index for parameters (default: 0, meaning first param is $1)
 * @returns Parameterized condition and ordered input values array
 */
export const getConditionPieces = (data: Record<string, any> = {}, startIndex: number = 0): ParameterizedPieces => {
    const keys = Object.keys(data).filter(key => isValidIdentifier(key));
    const condition = keys.map((key, i) => `${key} = $${startIndex + i + 1}`).join(' AND ');
    const inputs: any[] = keys.map(key => sanitizeValue(data[key]));
    return { condition, inputs };
};

/**
 * Converts an object into a parameterized INSERT fragment.
 *
 * @param data - The key/value pairs to insert
 * @returns Column names, positional placeholders ($1, $2...), and ordered input values
 */
export const getInsertPieces = (data: Record<string, any> = {}): InsertPieces => {
    const keys = Object.keys(data).filter(key => isValidIdentifier(key));
    const columns = keys.join(', ');
    const values = keys.map((_, i) => `$${i + 1}`).join(', ');
    const inputs: any[] = keys.map(key => sanitizeValue(data[key]));
    return { columns, values, inputs };
};

/**
 * Validates that a SQL identifier (table/column name) contains only safe characters.
 */
export const isValidIdentifier = (name: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
};

/**
 * Sanitizes a value for use as a SQL parameter.
 * Converts undefined/NaN to null, booleans to true/false, bigint to string.
 */
function sanitizeValue(value: any): any {
    if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) {
        return null;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}
