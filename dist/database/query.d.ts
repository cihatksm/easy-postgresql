export interface QueryResult {
    status: number;
    message: string;
    data: any[] | null;
}
/**
 * Executes a raw SQL query with optional parameterized inputs.
 *
 * @param query - The SQL query to execute. Use @paramName for named parameters or $1, $2 for positional.
 * @param inputs - Optional key/value map of named parameters (Record) or ordered values array
 * @returns Promise<QueryResult>
 */
export declare const Query: (query: string, inputs?: Record<string, any> | any[]) => Promise<QueryResult>;
