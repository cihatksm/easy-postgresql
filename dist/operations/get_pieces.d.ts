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
export declare const getConditionPieces: (data?: Record<string, any>, startIndex?: number) => ParameterizedPieces;
/**
 * Converts an object into a parameterized INSERT fragment.
 *
 * @param data - The key/value pairs to insert
 * @returns Column names, positional placeholders ($1, $2...), and ordered input values
 */
export declare const getInsertPieces: (data?: Record<string, any>) => InsertPieces;
/**
 * Validates that a SQL identifier (table/column name) contains only safe characters.
 */
export declare const isValidIdentifier: (name: string) => boolean;
